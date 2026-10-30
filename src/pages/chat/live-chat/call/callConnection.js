// WebRTC 1:1 ulanish: ovoz + kamera + ekran uchun 3 ta transceiver oldindan ochiladi (yoqish/o'chirishda qayta kelishuv yo'q).

// Sekin internet (<1 Mbit/s) uchun chegaralar.
export const MEDIA_LIMITS = {
  audioBitrate: 24_000,
  cameraBitrate: 250_000,
  cameraFps: 15,
  screenBitrate: 250_000,
  screenFps: 5
}

export const CAMERA_CONSTRAINTS = {
  width: { ideal: 320 },
  height: { ideal: 240 },
  frameRate: { ideal: MEDIA_LIMITS.cameraFps, max: MEDIA_LIMITS.cameraFps }
}

export const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true
}

const SLOT = { audio: 0, camera: 1, screen: 2 }
const STATS_INTERVAL_MS = 2000

// RTT (s) va paket yo'qolishi (%) bo'yicha aloqa sifati.
export const qualityOf = ({ rtt, loss }) => {
  if (rtt == null && loss == null) return 'unknown'
  if ((rtt ?? 0) < 0.3 && (loss ?? 0) < 3) return 'good'
  if ((rtt ?? 0) < 0.6 && (loss ?? 0) < 8) return 'medium'
  return 'bad'
}

// polite — kelishuv to'qnashuvida o'z taklifini qaytarib oladigan tomon (qabul qiluvchi).
export const createCallConnection = ({
  iceServers,
  initiator,
  onSignal,
  onRemote,
  onStats,
  onState
}) => {
  const pc = new RTCPeerConnection({
    iceServers,
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle'
  })
  const polite = !initiator
  let makingOffer = false
  let ignoreOffer = false
  let statsTimer = null
  let prevInbound = null
  const remote = { main: new MediaStream(), screen: new MediaStream() }

  if (initiator) {
    pc.addTransceiver('audio', { direction: 'sendrecv' })
    pc.addTransceiver('video', { direction: 'sendrecv' })
    pc.addTransceiver('video', { direction: 'sendrecv' })
  }

  const transceiver = (slot) => pc.getTransceivers()[slot] ?? null

  const limitSender = async (slot, maxBitrate, maxFramerate) => {
    const sender = transceiver(slot)?.sender
    if (!sender?.getParameters) return
    const params = sender.getParameters()
    if (!params.encodings?.length) params.encodings = [{}]
    params.encodings[0].maxBitrate = maxBitrate
    if (maxFramerate) params.encodings[0].maxFramerate = maxFramerate
    if (slot !== SLOT.audio) params.degradationPreference = 'balanced'
    await sender.setParameters(params).catch(() => {})
  }

  const setTrack = async (slot, track) => {
    const t = transceiver(slot)
    if (!t) return
    await t.sender.replaceTrack(track ?? null)
    if (!track) return
    if (slot === SLOT.audio) await limitSender(slot, MEDIA_LIMITS.audioBitrate)
    if (slot === SLOT.camera)
      await limitSender(slot, MEDIA_LIMITS.cameraBitrate, MEDIA_LIMITS.cameraFps)
    if (slot === SLOT.screen)
      await limitSender(slot, MEDIA_LIMITS.screenBitrate, MEDIA_LIMITS.screenFps)
  }

  pc.ontrack = (e) => {
    const slot = pc.getTransceivers().indexOf(e.transceiver)
    const target = slot === SLOT.screen ? remote.screen : remote.main
    if (!target.getTracks().includes(e.track)) target.addTrack(e.track)
    onRemote?.({ main: remote.main, screen: remote.screen })
  }

  pc.onnegotiationneeded = async () => {
    try {
      makingOffer = true
      await pc.setLocalDescription()
      onSignal({ description: pc.localDescription })
    } catch {
      // keyingi negotiationneeded qayta urinadi
    } finally {
      makingOffer = false
    }
  }

  pc.onicecandidate = ({ candidate }) => {
    if (candidate) onSignal({ candidate })
  }

  pc.onconnectionstatechange = () => onState?.(pc.connectionState)

  // Tarmoq qisqa uzilsa ICE qayta boshlanadi (qo'ng'iroq va taymer o'sha-o'sha qoladi).
  pc.oniceconnectionstatechange = () => {
    if (pc.iceConnectionState === 'failed') pc.restartIce()
  }

  const handleSignal = async ({ description, candidate }) => {
    if (description) {
      const collision =
        description.type === 'offer' && (makingOffer || pc.signalingState !== 'stable')
      ignoreOffer = !polite && collision
      if (ignoreOffer) return
      await pc.setRemoteDescription(description)
      if (description.type === 'offer') {
        // Qabul qiluvchi transceiverlari taklifdan yaratiladi — yuborishga ochiladi.
        pc.getTransceivers().forEach((t) => (t.direction = 'sendrecv'))
        await applyPending()
        await pc.setLocalDescription()
        onSignal({ description: pc.localDescription })
      }
    } else if (candidate) {
      try {
        await pc.addIceCandidate(candidate)
      } catch (err) {
        if (!ignoreOffer) throw err
      }
    }
  }

  // Transceiver hali yo'q paytda (qabul qiluvchi, taklifdan oldin) berilgan treklar shu yerda kutadi.
  const pending = {}
  const applyPending = async () => {
    for (const [slot, track] of Object.entries(pending)) {
      if (transceiver(Number(slot))) {
        await setTrack(Number(slot), track)
        delete pending[slot]
      }
    }
  }
  const useTrack = async (slot, track) => {
    if (transceiver(slot)) return setTrack(slot, track)
    pending[slot] = track
  }

  const readStats = async () => {
    const report = await pc.getStats().catch(() => null)
    if (!report) return
    let rtt = null
    let relayed = false
    let localCandidateId = null
    let received = 0
    let lost = 0
    report.forEach((s) => {
      if (s.type === 'candidate-pair' && s.nominated && s.state === 'succeeded') {
        rtt = s.currentRoundTripTime ?? rtt
        localCandidateId = s.localCandidateId
      }
      if (s.type === 'inbound-rtp' && !s.isRemote) {
        received += s.packetsReceived ?? 0
        lost += s.packetsLost ?? 0
      }
    })
    if (localCandidateId) relayed = report.get(localCandidateId)?.candidateType === 'relay'
    let loss = null
    if (prevInbound) {
      const dr = received - prevInbound.received
      const dl = lost - prevInbound.lost
      loss = dr + dl > 0 ? (Math.max(0, dl) / (dr + dl)) * 100 : 0
    }
    prevInbound = { received, lost }
    onStats?.({ rtt, loss, relayed, quality: qualityOf({ rtt, loss }) })
  }

  return {
    pc,
    remote,
    handleSignal,
    setMic: (track) => useTrack(SLOT.audio, track),
    setCamera: (track) => useTrack(SLOT.camera, track),
    setScreen: (track) => {
      if (track) track.contentHint = 'text'
      return useTrack(SLOT.screen, track)
    },
    startStats() {
      statsTimer ??= setInterval(readStats, STATS_INTERVAL_MS)
    },
    close() {
      clearInterval(statsTimer)
      statsTimer = null
      pc.getSenders().forEach((s) => s.track?.stop())
      pc.close()
    }
  }
}

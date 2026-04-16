<script setup>
  import { ref, watch, onMounted, onUnmounted } from 'vue'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import { Location24Regular, Checkmark24Regular, ArrowUndo24Regular } from '@vicons/fluent'

  const props = defineProps({
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    },
    radius: {
      type: Number,
      default: 500
    },
    polygon: {
      type: Array,
      default: () => []
    },
    geoType: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['update:lat', 'update:lng', 'update:polygon', 'update:radius'])

  const mapContainer = ref(null)
  const isDrawingPolygon = ref(false)
  const polygonPoints = ref([])

  let map = null
  let marker = null
  let circle = null
  let polygonLayer = null
  let polygonCircles = []
  let polygonLines = null

  // Default center - Tashkent
  const defaultCenter = { lat: 41.311081, lng: 69.240562 }

  // Fix leaflet icon issue
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
  })

  const initMap = () => {
    if (!mapContainer.value) return

    const initialLat = props.lat || defaultCenter.lat
    const initialLng = props.lng || defaultCenter.lng

    map = L.map(mapContainer.value).setView([initialLat, initialLng], 16)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    // Load existing data based on geoType
    if (props.geoType) {
      // Polygon mode - load existing polygon
      if (props.polygon && props.polygon.length > 0) {
        loadExistingPolygon(props.polygon)
      }
    } else {
      // Marker mode - load existing marker
      if (props.lat && props.lng) {
        addMarker(props.lat, props.lng)
        if (props.radius) {
          addCircle(props.lat, props.lng, props.radius)
        }
      }
    }

    // Handle map click based on geoType
    map.on('click', (e) => {
      const { lat, lng } = e.latlng

      if (props.geoType) {
        // Polygon mode - add point only when drawing
        if (isDrawingPolygon.value && polygonPoints.value.length < 12) {
          addPolygonPoint(lat, lng)
        }
      } else {
        // Marker mode - always active, click to place/move marker
        addMarker(lat, lng)
        addCircle(lat, lng, props.radius)
        emit('update:lat', parseFloat(lat.toFixed(6)))
        emit('update:lng', parseFloat(lng.toFixed(6)))
      }
    })
  }

  // Start polygon drawing mode
  const startPolygonDrawing = () => {
    isDrawingPolygon.value = true

    // Clear existing polygon
    clearPolygonVisuals()
    if (polygonLayer) {
      map.removeLayer(polygonLayer)
      polygonLayer = null
    }
    polygonPoints.value = []

    // Clear marker
    if (marker) {
      map.removeLayer(marker)
      marker = null
    }
  }

  const loadExistingPolygon = (points) => {
    polygonPoints.value = points.map(p => ({ lat: p.lat, lng: p.lng }))
    drawPolygon()

    // Show center marker if lat/lng exists
    if (props.lat && props.lng) {
      addCenterMarker(props.lat, props.lng)
    }
  }

  const addPolygonPoint = (lat, lng) => {
    const point = {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6))
    }
    polygonPoints.value.push(point)

    // Add circle marker for the point
    const circleMarker = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: '#3b82f6',
      color: '#1d4ed8',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map)

    // Add point number
    const numberIcon = L.divIcon({
      className: 'polygon-point-number',
      html: `<div style="
        background: #3b82f6;
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${polygonPoints.value.length}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
    const numberMarker = L.marker([lat, lng], { icon: numberIcon }).addTo(map)

    polygonCircles.push({ circle: circleMarker, number: numberMarker })

    // Update polygon lines
    updatePolygonLines()
  }

  const updatePolygonLines = () => {
    // Remove existing lines
    if (polygonLines) {
      map.removeLayer(polygonLines)
    }

    if (polygonPoints.value.length >= 2) {
      const latLngs = polygonPoints.value.map(p => [p.lat, p.lng])
      // Close the polygon if more than 2 points
      if (polygonPoints.value.length >= 3) {
        latLngs.push(latLngs[0])
      }
      polygonLines = L.polyline(latLngs, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 5'
      }).addTo(map)
    }
  }

  const drawPolygon = () => {
    // Clear existing polygon layer
    if (polygonLayer) {
      map.removeLayer(polygonLayer)
    }

    // Clear existing circles and lines
    clearPolygonVisuals()

    if (polygonPoints.value.length >= 3) {
      const latLngs = polygonPoints.value.map(p => [p.lat, p.lng])
      polygonLayer = L.polygon(latLngs, {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(map)

      // Add circle markers for each point
      polygonPoints.value.forEach((point, index) => {
        const circleMarker = L.circleMarker([point.lat, point.lng], {
          radius: 8,
          fillColor: '#3b82f6',
          color: '#1d4ed8',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map)

        const numberIcon = L.divIcon({
          className: 'polygon-point-number',
          html: `<div style="
            background: #3b82f6;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${index + 1}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
        const numberMarker = L.marker([point.lat, point.lng], { icon: numberIcon }).addTo(map)

        polygonCircles.push({ circle: circleMarker, number: numberMarker })
      })
    }
  }

  const clearPolygonVisuals = () => {
    polygonCircles.forEach(item => {
      if (item.circle) map.removeLayer(item.circle)
      if (item.number) map.removeLayer(item.number)
    })
    polygonCircles = []

    if (polygonLines) {
      map.removeLayer(polygonLines)
      polygonLines = null
    }
  }

  // Calculate polygon center (centroid)
  const calculatePolygonCenter = (points) => {
    if (points.length === 0) return null

    let sumLat = 0
    let sumLng = 0

    points.forEach(point => {
      sumLat += point.lat
      sumLng += point.lng
    })

    return {
      lat: parseFloat((sumLat / points.length).toFixed(6)),
      lng: parseFloat((sumLng / points.length).toFixed(6))
    }
  }

  const finishPolygon = () => {
    isDrawingPolygon.value = false

    if (polygonPoints.value.length >= 3) {
      // Draw final polygon
      drawPolygon()
      // Emit polygon data
      emit('update:polygon', [...polygonPoints.value])

      // Calculate center and show draggable marker
      const center = calculatePolygonCenter(polygonPoints.value)
      if (center) {
        addCenterMarker(center.lat, center.lng)
        emit('update:lat', center.lat)
        emit('update:lng', center.lng)
      }

      window.$message?.success('Polygon saqlandi. Markerni surib joylashuvni o\'zgartirishingiz mumkin.')
    } else {
      // Not enough points
      clearPolygon()
      window.$message?.warning('Kamida 3 ta nuqta kerak')
    }
  }

  // Add center marker for polygon mode (draggable)
  const addCenterMarker = (lat, lng) => {
    if (marker) {
      map.removeLayer(marker)
    }

    marker = L.marker([lat, lng], { draggable: true }).addTo(map)

    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng()
      emit('update:lat', parseFloat(lat.toFixed(6)))
      emit('update:lng', parseFloat(lng.toFixed(6)))
    })
  }

  const undoLastPoint = () => {
    if (polygonPoints.value.length > 0) {
      // Remove last point
      polygonPoints.value.pop()

      // Remove last circle and number marker
      const lastItem = polygonCircles.pop()
      if (lastItem) {
        if (lastItem.circle) map.removeLayer(lastItem.circle)
        if (lastItem.number) map.removeLayer(lastItem.number)
      }

      // Update lines
      updatePolygonLines()
    }
  }

  const cancelPolygonDrawing = () => {
    isDrawingPolygon.value = false
    clearPolygonVisuals()
    polygonPoints.value = []

    // Reload existing polygon if any
    if (props.polygon && props.polygon.length > 0) {
      loadExistingPolygon(props.polygon)
    }
  }

  const addMarker = (lat, lng) => {
    if (marker) {
      map.removeLayer(marker)
    }
    marker = L.marker([lat, lng], { draggable: true }).addTo(map)

    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng()
      emit('update:lat', parseFloat(lat.toFixed(6)))
      emit('update:lng', parseFloat(lng.toFixed(6)))
      if (circle) {
        circle.setLatLng([lat, lng])
      }
    })
  }

  const addCircle = (lat, lng, radius) => {
    if (circle) {
      map.removeLayer(circle)
    }
    circle = L.circle([lat, lng], {
      radius: radius,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      weight: 2
    }).addTo(map)
  }

  // Watch radius changes
  watch(() => props.radius, (newRadius) => {
    if (circle && newRadius) {
      circle.setRadius(newRadius)
    }
  })

  // Watch lat/lng changes - move marker and map
  watch([() => props.lat, () => props.lng], ([newLat, newLng], [oldLat, oldLng]) => {
    if (map && newLat && newLng) {
      // Only update if values actually changed (not from marker drag)
      const latChanged = newLat !== oldLat
      const lngChanged = newLng !== oldLng

      if (latChanged || lngChanged) {
        if (props.geoType) {
          // Polygon mode - update center marker
          addCenterMarker(newLat, newLng)
        } else {
          // Marker mode - update marker and circle
          addMarker(newLat, newLng)
          addCircle(newLat, newLng, props.radius)
        }
        // Pan map to new location
        map.setView([newLat, newLng], map.getZoom())
      }
    }
  })

  // Watch geoType changes - switch mode and clear opposite data
  watch(() => props.geoType, (newValue) => {
    if (map) {
      isDrawingPolygon.value = false
      if (newValue) {
        // Switched to polygon mode - clear marker
        clearMarker()
      } else {
        // Switched to marker mode - clear polygon
        clearPolygon()
      }
    }
  })

  // Clear polygon
  const clearPolygon = () => {
    clearPolygonVisuals()
    if (polygonLayer) {
      map.removeLayer(polygonLayer)
      polygonLayer = null
    }
    polygonPoints.value = []
    emit('update:polygon', [])

    // Clear marker too
    if (marker) {
      map.removeLayer(marker)
      marker = null
    }
    emit('update:lat', null)
    emit('update:lng', null)
  }

  // Clear marker
  const clearMarker = () => {
    if (marker) {
      map.removeLayer(marker)
      marker = null
    }
    if (circle) {
      map.removeLayer(circle)
      circle = null
    }
    emit('update:lat', null)
    emit('update:lng', null)
  }

  // Get user's current location (for marker mode)
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          addMarker(lat, lng)
          addCircle(lat, lng, props.radius)
          emit('update:lat', parseFloat(lat.toFixed(6)))
          emit('update:lng', parseFloat(lng.toFixed(6)))
          map.setView([lat, lng], 17)
        },
        (error) => {
          console.error('Geolocation error:', error)
          window.$message?.error('Joylashuvni aniqlab bo\'lmadi')
        }
      )
    }
  }

  defineExpose({ clearPolygon, clearMarker, getCurrentLocation })

  onMounted(() => {
    setTimeout(() => {
      initMap()
    }, 100)
  })

  onUnmounted(() => {
    if (map) {
      map.remove()
      map = null
    }
  })
</script>

<template>
  <div class="location-map-wrapper">
    <!-- Map controls header -->
    <div class="map-header">
      <div class="flex items-center gap-2">
        <n-icon size="20" color="#3b82f6">
          <Location24Regular />
        </n-icon>
        <span class="font-medium text-gray-700">{{ $t('departmentLocationPage.map.title') }}</span>
      </div>

      <!-- MARKER MODE CONTROLS (geoType = false) -->
      <template v-if="!geoType">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button size="small" type="info" secondary @click="getCurrentLocation">
              <template #icon>
                <n-icon><Location24Regular /></n-icon>
              </template>
            </n-button>
          </template>
          {{ $t('departmentLocationPage.map.myLocation') }}
        </n-tooltip>
      </template>

      <!-- POLYGON MODE CONTROLS (geoType = true) -->
      <template v-else>
        <!-- Not drawing - show start button -->
        <div v-if="!isDrawingPolygon" class="flex items-center gap-2">
          <n-button size="small" type="primary" @click="startPolygonDrawing">
            {{ $t('departmentLocationPage.map.addPolygon') }}
          </n-button>
        </div>

        <!-- Drawing mode - show controls -->
        <div v-else class="flex items-center gap-2">
          <span class="points-badge">
            <b>{{ polygonPoints.length }}</b>/12
          </span>

          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button
                size="small"
                type="warning"
                :disabled="polygonPoints.length === 0"
                @click="undoLastPoint"
              >
                <template #icon>
                  <n-icon><ArrowUndo24Regular /></n-icon>
                </template>
              </n-button>
            </template>
            {{ $t('departmentLocationPage.map.undo') }}
          </n-tooltip>

          <n-button
            size="small"
            type="success"
            :disabled="polygonPoints.length < 3"
            @click="finishPolygon"
          >
            <template #icon>
              <n-icon><Checkmark24Regular /></n-icon>
            </template>
            {{ $t('departmentLocationPage.map.save') }}
          </n-button>

          <n-button size="small" type="error" secondary @click="cancelPolygonDrawing">
            {{ $t('content.cancel') }}
          </n-button>
        </div>
      </template>
    </div>

    <!-- Map container -->
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.location-map-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.map-container {
  flex: 1;
  min-height: 300px;
}

.points-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}
</style>

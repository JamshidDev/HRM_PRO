@extends('layouts.master')

@section('main')

    <div style="visibility: hidden">
        <label id="message" style="color: red;"></label>
        <label for="pfx"></label><input type="radio" id="pfx" name="keyType" value="pfx" onchange="keyType_changed()"
                                        checked="checked">
    </div>

    <div class="dasuty__imzo-page">
        <div class="app-body" id="cardContainer">
        </div>
    </div>

    <div style="visibility: hidden">
        <input type="radio" id="idcard" name="keyType" value="idcard" onchange="keyType_changed()">
        <label for="idcard" class="d-none">ID-card</label> - <label id="plugged" class="d-none">не
            подключена</label><br>
    </div>

@endsection

@push('scripts')
    <script lang="javascript">

        function closeModalOnParent($status, $data, $statusCode) {
            window.parent.postMessage(
                {
                    status: $status,
                    data: $data,
                    statusCode: $statusCode
                }, '*');
        }

        let signatures = [];

        function uiCreateItem(itemKey, vo) {
            let now = new Date();
            vo.expired = dates.compare(now, vo.validTo) > 0;
            let itm = [];
            itm.value = itemKey;
            itm.full_name = vo.CN;
            itm.vo = vo;
            itm.id = itemKey;
            itm.expired = false;

            if (vo.T.length > 0) {
                itm.key_status = true;
                itm.key_type = 'Юридическое лицо'
            } else {
                itm.key_status = false;
                itm.key_type = 'Физическое лицо';
            }

            itm.expired = vo.expired;

            itm.validDate = dateFormat(vo.validTo);

            return itm;
        }

        function dateFormat(dateTime) {
            const date = new Date(dateTime);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Месяцы в JS считаются с 0
            const year = date.getFullYear();

            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');

            return `${day}:${month}:${year} ${hours}:${minutes}:${seconds}`;

        }

        function uiAppLoad() {
            EIMZOClient.listAllUserKeys(function (o, i) {
                return "itm-" + o.serialNumber + "-" + i;
            }, function (itemId, v) {
                return uiCreateItem(itemId, v);
            }, function (items, firstId) {
                signatures = items;
                uiFillCombo(items);
            }, function (e, r) {
                if (e) {
                    uiShowMessage(errorCAPIWS + " : " + e);
                } else {
                    console.log(r);
                }
            });
            EIMZOClient.idCardIsPLuggedIn(function (yes) {
                document.getElementById('plugged').innerHTML = yes ? 'подключена' : 'не подключена';
            }, function (e, r) {
                if (e) {
                    uiShowMessage(errorCAPIWS + " : " + e);
                } else {
                    console.log(r);
                }
            })
        }

        function uiFillCombo(items) {
            items.forEach((item, index) => {
                let cardHtml = `<div class="imzo__card-box valid__card ${item.expired && 'invalid__card'}" onclick="accepted(${index})">
                  <div class="card__fulname"> ${item.full_name} </div>
                  <div class="card__row">
                    <div class="card__col" style="width:33%">
                      <div class="card__subtitle">
                        ПИНФЛ:
                      </div>
                      <div class="card__title">
                        ${item.vo.PINFL}
                      </div>
                    </div>
                    <div class="card__col" style="width:33%">
                      <div class="card__subtitle">
                        ИНН:
                      </div>
                      <div class="card__title">
                        ${item.vo.UID}
                      </div>
                    </div>
                    <div class="card__col" style="width:33%">
                      <div class="card__subtitle">
                        Тип:
                      </div>
                      <div class="card__title text-primary">
                        ${item.key_type}
                      </div>
                    </div>
                  </div>

                   <div class="card__row ${!item.key_status && 'd-none'}">
                    <div class="card__col" style="width:100%">
                      <div class="card__subtitle">
                        Организация:
                      </div>
                      <div class="card__title">
                        ${item.vo.O}
                      </div>
                    </div>
                  </div>

                  <div class="card__row">
                    <div class="card__col" style="width:33%">
                      <div class="card__subtitle">
                        № сертификата:
                      </div>
                      <div class="card__title">
                        ${item.vo.name}
                      </div>
                    </div>
                    <div class="card__col" style="width:33%">
                      <div class="card__subtitle">
                        Срок действия сертификата:
                      </div>
                      <div class="card__title">
                        ${item.validDate}
                      </div>
                    </div>
                  </div>
                <div class="card__row invalid__row">
                    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.1906 16.3033L12.95 2.05328C12.7527 1.71056 12.4686 1.42589 12.1262 1.22795C11.7839 1.03 11.3954 0.925781 11 0.925781C10.6045 0.925781 10.2161 1.03 9.87373 1.22795C9.53139 1.42589 9.24727 1.71056 9.04998 2.05328V2.05328L0.80936 16.3033C0.609173 16.6443 0.502786 17.0322 0.500999 17.4276C0.499213 17.823 0.602092 18.2118 0.79919 18.5546C0.996287 18.8973 1.28058 19.1819 1.62321 19.3792C1.96583 19.5766 2.35458 19.6798 2.74998 19.6783H19.25C19.6454 19.6798 20.0341 19.5766 20.3768 19.3792C20.7194 19.1819 21.0037 18.8973 21.2008 18.5546C21.3979 18.2118 21.5008 17.823 21.499 17.4276C21.4972 17.0322 21.3908 16.6443 21.1906 16.3033V16.3033ZM10.25 8.42828C10.25 8.22937 10.329 8.03861 10.4697 7.89795C10.6103 7.7573 10.8011 7.67828 11 7.67828C11.1989 7.67828 11.3897 7.7573 11.5303 7.89795C11.671 8.03861 11.75 8.22937 11.75 8.42828V12.1783C11.75 12.3772 11.671 12.568 11.5303 12.7086C11.3897 12.8493 11.1989 12.9283 11 12.9283C10.8011 12.9283 10.6103 12.8493 10.4697 12.7086C10.329 12.568 10.25 12.3772 10.25 12.1783V8.42828ZM11 16.6783C10.7775 16.6783 10.56 16.6123 10.375 16.4887C10.19 16.3651 10.0458 16.1894 9.96062 15.9838C9.87547 15.7782 9.85319 15.552 9.8966 15.3338C9.94001 15.1156 10.0472 14.9151 10.2045 14.7578C10.3618 14.6005 10.5623 14.4933 10.7805 14.4499C10.9987 14.4065 11.2249 14.4288 11.4305 14.5139C11.6361 14.5991 11.8118 14.7433 11.9354 14.9283C12.059 15.1133 12.125 15.3308 12.125 15.5533C12.125 15.8517 12.0065 16.1378 11.7955 16.3488C11.5845 16.5598 11.2984 16.6783 11 16.6783Z" fill="#EA0707"/>
                    </svg>
                    <span class="invalid__message">Срок ключа истек!</span>
              </div>
                </div>`;

                let cardElement = document.createElement('div');
                cardElement.innerHTML = cardHtml;
                document.getElementById('cardContainer').appendChild(cardElement);
            })
        }

        function accepted(index) {
            uiShowProgress();
            let item = signatures[index];

            if (item.expired) {
                uiShowMessage('Срок ключа истек!');
                return;
            }

            getChallenge(function (challenge) {
                if (item) {
                    let vo = item.vo;

                    EIMZOClient.loadKey(vo, function (id) {

                        acceptSignature(id, vo, challenge, function (redirect) {
                            window.location.href = redirect;
                            uiShowProgress();
                        });

                    }, uiHandleError);
                } else {
                    uiHideProgress();
                }
            });
        }

        function acceptSignature(keyId, vo) {

            let model = `{{ request()->get('model', 0) }}`;
            let documentId = `{{ request()->get('document',0) }}`;
            let secret = `{{ request()->get('secret', 0) }}`;

            microAjax('api/check-document', function (data, s) {
                let res = JSON.parse(s.response);

                if (s.status !== 200) {
                    console.log(s);
                    uiShowMessage(s.status + " - " + res.message);
                    return;
                }

                try {
                    let data = res.documentBase64;
                    let modelId = res.modelId;

                    EIMZOClient.createPkcs7(keyId, data, null, function (pkcs7) {

                        attachTimestamp(pkcs7, modelId, function (pkcs7W) {});}, uiHandleError);

                } catch (e) {
                    uiShowMessage(s.status + " - " + s.statusText + "<br />" + e);
                }

            }, 'model=' + model + '&document=' + documentId + '&secret=' + secret + '&pin=' + vo.PINFL);

        }

        function attachTimestamp(pkcs7, modelId, callback) {
            microAjax('/api/timestamp', function (data, s) {

                if (s.status !== 200) {
                    uiShowMessage(s.status + " - " + s.statusText);
                    return;
                }

                let res = JSON.parse(s.response);
                let pkcs7W;
                try {

                    if (res.status !== 1) {
                        uiShowMessage(res.status + " - " + res.message);
                        return;
                    }
                    pkcs7W = res.pkcs7b64;

                    verify(pkcs7W, modelId, data, function (result) {});

                } catch (e) {
                    uiShowMessage(res.status + " - " + res.statusText + "<br />" + e);
                }

                callback(pkcs7W);
            }, pkcs7);
        }

        function verify(pkcs7W, modelId) {

            microAjax('api/verify', function (data, s) {
                let res = JSON.parse(s.response);

                if (s.status !== 200) {
                    uiShowMessage(s.status + " - " + res.message);
                    return;
                }
                uiShowMessage(s.status + " - " + res.message);

            }, 'pkcs7W=' + encodeURIComponent(pkcs7W) + '&modelId=' + modelId);
        }


        function uiShowMessage(message) {
            Toastify({
                text: message,
                duration: 3000
            }).showToast();
        }


        function keyType_changed() {
            let keyType = 'pfx'; //document.testform.keyType.value;
            // document.getElementById('signButton').innerHTML = keyType === "pfx" ? "Вход ключем PFX" : "Вход ключем ID-card";
        }

        keyType_changed();

        function uiShowProgress() {
            // let l = document.getElementById('progress');
            // l.innerHTML = 'Идет подписание, ждите.';
            // l.style.color = 'green';
        }

        function uiHideProgress() {
            // let l = document.getElementById('progress');
            // l.innerHTML = '';
        }

        // EIMZOClient.createPkcs7(keyId, challenge, null, function (pkcs7) {
        //     microAjax('api/signature-accept', function (response, s)
        //     {
        //         response = JSON.parse(response);
        //         uiHideProgress();
        //         if (s.status !== 200) {
        //
        //             if(s.status === 400 && response.signature === 'error') {
        //                 uiShowMessage(response.message);
        //                 closeModalOnParent('error', response, s.status);
        //             }
        //
        //             uiShowMessage(response.message);
        //             closeModalOnParent('error', response, s.status);
        //             return;
        //         }
        //         try {
        //             closeModalOnParent('success', response, 200);
        //             // let data = JSON.parse(response);
        //             // if (data.status !== 1) {
        //             //     uiShowMessage(data.status + " - " + data.message);
        //             //     return;
        //             // }
        //             // callback(data.redirect);
        //         } catch (e) {
        //             closeModalOnParent('error', s.statusText, s.status);
        //             uiShowMessage(s.statusText + ": " + e);
        //         }
        //
        //     }, 'keyId=' + encodeURIComponent(keyId) + '&pkcs7=' + encodeURIComponent(pkcs7) + '&model=' + model + '&document=' + documentId + '&secret=' + secret + '&type=' + type);
        // }, uiHandleError, false);

        function getChallenge(callback) {
            microAjax('api/signature-key?_uc=' + (Date.now() + "_" + Math.random()), function (data, s) {
                data = JSON.parse(data)
                let status = data.status;
                data = data.data;

                if (status === 500) {
                    uiShowMessage(data);
                    return;
                }

                if (status !== 200) {
                    uiShowMessage(s.statusText);
                    return;
                }
                try {
                    if (data.status !== 1) {
                        uiShowMessage(data.message);
                        return;
                    }
                    callback(data.challenge);
                } catch (e) {
                    uiShowMessage(s.statusText + ": " + e);
                }
            });
        }

        window.onload = AppLoad;
    </script>
@endpush



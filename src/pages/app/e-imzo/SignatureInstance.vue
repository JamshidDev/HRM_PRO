<script setup>
// import "./app/micro-ajax.js"
// import "./app/e-imzo.js"
// import "./app/e-imzo-client.js"
// import "./app/e-imzo-init.js"

const initialSignature = ()=>{
  AppLoad()

  EIMZOClient.listAllUserKeys(function (o, i) {
    return "itm-" + o.serialNumber + "-" + i;
  }, function (itemId, v) {
    console.log(v)
    return uiCreateItem(itemId, v);
  }, function (items, firstId) {
    console.log(items)
  }, function (e, r) {
    console.log(e)
    if (e) {
      uiShowMessage(errorCAPIWS + " : " + e);
    } else {
      console.log(r);
    }
  });

  EIMZOClient.idCardIsPLuggedIn(function (yes) {
    console.log(yes)
    // document.getElementById('plugged').innerHTML = yes ? 'подключена' : 'не подключена';
  }, function (e, r) {
    if (e) {
      uiShowMessage(errorCAPIWS + " : " + e);
    } else {
      console.log(r);
    }
  })
}


const uiCreateItem =(itemKey, vo) =>{
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

const dateFormat =(dateTime)=> {
  const date = new Date(dateTime);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Месяцы в JS считаются с 0
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${day}:${month}:${year} ${hours}:${minutes}:${seconds}`;

}

onMounted(()=>{
  initialSignature()
})
</script>

<template>

</template>

<style scoped>

</style>
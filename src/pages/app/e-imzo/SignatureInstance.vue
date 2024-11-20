<script setup>
// import "./app/micro-ajax.js"
// import "./app/e-imzo.js"
// import "./app/e-imzo-client.js"
// import "./app/e-imzo-init.js"

const initialSignature = ()=>{
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
}
onMounted(()=>{
  initialSignature()
})
</script>

<template>

</template>

<style scoped>

</style>
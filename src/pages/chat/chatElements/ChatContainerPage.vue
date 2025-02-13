<script setup>
const initialObserver = ()=>{

  const callBack = (entries, observer)=>{
    entries.forEach((v)=>{
      const index = v.target.getAttribute("data-index");
      // console.log((Number(index)+1) + ' - '+  v.isIntersecting )
    })
  }

  const options = {
    threshold: 0.5,
  }
  const observer = new IntersectionObserver(callBack, options)
  document.querySelectorAll(".message").forEach((el) => observer.observe(el))

}




const scrollEv = ()=>{
  const element = document.querySelector('.chat-panel-container')
  if(element.scrollHeight -  element.clientHeight === element.scrollTop){
    console.log('scroll bottom 0 px')
  }else if (element.scrollTop === 0){
    console.log('scroll top 0 px')
  }
}

onMounted(()=>{
  initialObserver()
  const element = document.querySelector('.chat-panel-container')
  element.addEventListener('scroll', scrollEv)
})




</script>

<template>
  <div class="w-full h-full flex justify-center items-start">
      <div class="chat-panel-container box-content w-[500px] h-[600px] border border-surface-600  mt-[100px] overflow-x-hidden overflow-y-scroll px-2" >
        <template v-for="(item, idx) in 100">
          <div class="w-full my-4 h-[50px] bg-blue-400 font-bold text-center rounded-md message" :data-index="idx"
          >{{idx+1}}</div>
        </template>
      </div>
  </div>
</template>

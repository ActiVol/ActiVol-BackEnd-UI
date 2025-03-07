<template>
   <i-frame v-model:src="url"></i-frame>
</template>

<script setup>
import iFrame from '@/components/iFrame'
import config from 'config'
const url = ref(config.baseURL + "/swagger-ui/index.html")
</script>

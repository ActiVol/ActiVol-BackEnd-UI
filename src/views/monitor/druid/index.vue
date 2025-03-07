<template>
   <div>
      <i-frame v-model:src="url"></i-frame>
   </div>
</template>

<script setup>
import iFrame from '@/components/iFrame'
import config from 'config';
import { ref } from 'vue';

const url = ref(config.baseURL + '/druid/login.html');
</script>

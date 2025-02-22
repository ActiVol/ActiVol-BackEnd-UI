<template>
  <i-frame :src="url" />
</template>
<script>
import iFrame from "@/components/iFrame/index";
import config from 'config';
export default {
  name: "Druid",
  components: { iFrame },
  data() {
    return {
      url: config.baseURL + "/druid/login.html"
    };
  },
};
</script>

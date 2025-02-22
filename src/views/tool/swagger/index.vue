<template>
  <i-frame :src="url" />
</template>
<script>
import iFrame from "@/components/iFrame/index";
import config from 'config';
export default {
  name: "Swagger",
  components: { iFrame },
  data() {
    return {
      url: config.baseURL + "/swagger-ui/index.html"
    };
  },
};
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
const user = useLogtoUser();

onMounted(() => {
  if (!user) {
    window.location.href = '/login';
  }
});
</script>

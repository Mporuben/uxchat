<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
const user = useLogtoUser();

onMounted(() => {
  // Redirect user to login
  if (!user) {
    window.location.href = '/login';
  }
});
</script>

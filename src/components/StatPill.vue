<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <article class="stat-pill">
    <span
      class="stat-pill__icon"
      aria-hidden="true"
    >
      <i :class="icon" />
    </span>

    <div class="stat-pill__content">
      <strong class="stat-pill__value">{{ value }}</strong>
      <span class="stat-pill__label">{{ label }}</span>
    </div>
  </article>
</template>

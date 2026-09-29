<template>
  <div class="column items-center q-py-xl q-gutter-md text-center">
    <q-icon name="warning" size="4em" color="warning" />
    <div class="text-h6">O que você procura não existe.</div>
    <q-btn color="primary" icon="home" label="Voltar para o início" :to="{ name: 'home' }" />
  </div>
</template>

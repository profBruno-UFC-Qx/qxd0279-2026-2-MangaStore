<template>
  <div class="column items-center q-py-xl q-gutter-md text-center">
    <q-avatar size="5em" color="warning" text-color="dark" icon="warning" />
    <div class="text-h6">O que você procura não existe.</div>
    <q-btn color="primary" icon="home" label="Voltar para o início" :to="{ name: 'home' }" />
  </div>
</template>

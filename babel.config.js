module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 54) já adiciona o react-native-worklets/plugin
    // automaticamente quando o pacote está instalado. NÃO adicionar de novo aqui:
    // aplicá-lo duas vezes quebra o runtime (transformação dupla de worklets).
    presets: ['babel-preset-expo'],
  };
};

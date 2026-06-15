module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 4 usa o plugin do react-native-worklets (deve ser o ÚLTIMO da lista)
    plugins: ['react-native-worklets/plugin'],
  };
};

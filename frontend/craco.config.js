module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const rule = webpackConfig.module.rules.find(r => r.oneOf);
      if (rule) {
        rule.oneOf.forEach(r => {
          if (r.include && r.include.toString().includes('node_modules')) {
            // Transpilar @mui/base
            r.exclude = /node_modules\/(?!(\@mui\/base)\/)/;
          }
        });
      }
      return webpackConfig;
    },
  },
};
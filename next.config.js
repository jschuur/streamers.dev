const { PrismaClient } = require('@prisma/client');
const { withSentryConfig } = require('@sentry/nextjs');
const slugify = require('slugify');

const prisma = new PrismaClient();

const moduleExports = {
  // handles shorter URLs for topics (e.g. https://streamers.dev/react)
  redirects: async () => {
    return (await prisma.keyword.findMany()).map((keyword) => {
      const slug = keyword.slug || slugify(keyword.tag, { lower: true, remove: '.' });

      return {
        source: `/${slug}`,
        destination: `/?topic=${slug}`,
        permanent: false,
      };
    });
  },
};

const SentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, SentryWebpackPluginOptions);

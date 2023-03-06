module.exports = {
  branches: ['main'],
  // eslint-disable-next-line no-template-curly-in-string
  tagFormat: 'v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/npm',
      {
        npmPublish: false
      }
    ],
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json'],
        message:
          // eslint-disable-next-line no-template-curly-in-string
          'chore(release): updating to ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ]
}

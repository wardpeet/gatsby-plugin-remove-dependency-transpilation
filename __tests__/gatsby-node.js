const path = require('path');
const moveFile = require('move-file');
const del = require('del');
const execa = require('execa');
const glob = require('globby');
const fs = require('fs');

describe('gatsby-plugin-remove-dependency-transpilation', () => {
  const gatsbyRoot = path.resolve(__dirname, '../__fixtures__/gatsby-build');
  beforeAll(async () => {
    await execa('yarn', {
      cwd: gatsbyRoot,
    });

    await moveFile(
      path.join(gatsbyRoot, 'fake_node_modules'),
      path.join(gatsbyRoot, 'node_modules')
    );

    await del([
      path.join(gatsbyRoot, 'public'),
      path.join(gatsbyRoot, '.cache'),
    ]);

    await execa(`yarn`, ['build'], {
      cwd: gatsbyRoot,
    });
  }, 60000);

  afterAll(async () => {
    await moveFile(
      path.join(gatsbyRoot, 'node_modules'),
      path.join(gatsbyRoot, 'fake_node_modules')
    );
  });

  it('should not transpile node_module code', async () => {
    const paths = await glob('public/component---src-pages-index-js-*', {
      cwd: gatsbyRoot,
    });
    const indexSrc = path.join(gatsbyRoot, paths[0]);

    const output = fs.readFileSync(indexSrc).toString();
    expect(output).toEqual(expect.stringContaining('async()=>'));
    expect(output).toEqual(expect.stringContaining('await'));
  });
});

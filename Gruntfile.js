const allBrowsers = ['firefox', 'chrome', 'edge', 'opera', 'safari'];
const zippedBrowsers = ['firefox', 'chrome', 'edge', 'opera'];

function configForTargets(targets, factory) {
  return Object.fromEntries(targets.map(target => [target, factory(target)]));
}

function currentTargetManifest() {
  return 'manifest.<%= grunt.task.current.target %>.json';
}

function manifestRewriteTarget() {
  return {
    files: [
      {
        src: currentTargetManifest(),
        dest: currentTargetManifest(),
      },
    ],
  };
}

function cleanTarget(target) {
  return [`build/${target}`];
}

function copyTarget(grunt) {
  return {
    files: [
      copyFile('cookie-editor.js'),
      copyTree('interface/**'),
      copyTree('icons/**'),
      copyManifest(grunt),
    ],
  };
}

function copyFile(src) {
  return {
    expand: true,
    src: [src],
    dest: 'build/<%= grunt.task.current.target %>/',
    filter: 'isFile',
  };
}

function copyTree(src) {
  return {
    expand: true,
    src: [src],
    dest: 'build/<%= grunt.task.current.target %>/',
  };
}

function copyManifest(grunt) {
  return {
    expand: true,
    src: currentTargetManifest(),
    dest: 'build/<%= grunt.task.current.target %>/',
    filter: 'isFile',
    rename(dest, src) {
      return dest + src.replace('.' + grunt.task.current.target, '');
    },
  };
}

function replaceTarget() {
  return {
    files: [
      {
        expand: true,
        flatten: true,
        src: ['interface/lib/env.js'],
        dest: 'build/<%= grunt.task.current.target %>/interface/lib/',
      },
    ],
  };
}

function compressTarget() {
  return {
    options: {
      archive:
        'dist/<%= pkg.version %>/<%= pkg.name %>-<%= grunt.task.current.target %>-<%= pkg.version %>.zip',
    },
    files: [
      {
        expand: true,
        cwd: 'build/<%= grunt.task.current.target %>/',
        src: ['**'],
        dest: '/',
      },
    ],
  };
}

function buildConfig(grunt) {
  return {
    pkg: grunt.file.readJSON('package.json'),
    'json-replace': {
      options: {
        space: '\t',
        replace: {
          version: '<%= pkg.version %>',
        },
      },
      ...configForTargets(allBrowsers, manifestRewriteTarget),
    },
    exec: {
      lint: 'npm run lint',
    },
    clean: configForTargets(allBrowsers, cleanTarget),
    copy: configForTargets(allBrowsers, () => copyTarget(grunt)),
    replace: {
      options: {
        patterns: [
          {
            match: 'browser_name',
            replacement: '<%= grunt.task.current.target %>',
          },
        ],
      },
      ...configForTargets(allBrowsers, replaceTarget),
    },
    removelogging: {
      dist: {
        src: 'build/**/*.js',
      },
    },
    compress: configForTargets(zippedBrowsers, compressTarget),
  };
}

function loadTasks(grunt) {
  [
    'grunt-json-replace',
    'grunt-exec',
    'grunt-contrib-clean',
    'grunt-contrib-copy',
    'grunt-replace',
    'grunt-remove-logging',
    'grunt-contrib-compress',
  ].forEach(task => grunt.loadNpmTasks(task));
}

function registerTasks(grunt) {
  grunt.registerTask('default', [
    'json-replace',
    'exec:lint',
    'clean',
    'copy',
    'replace',
    'removelogging',
    'compress',
  ]);

  grunt.registerTask('build-safari', [
    'json-replace:safari',
    'clean:safari',
    'copy:safari',
    'replace:safari',
    'removelogging',
  ]);
}

module.exports = function (grunt) {
  grunt.initConfig(buildConfig(grunt));
  loadTasks(grunt);
  registerTasks(grunt);
};

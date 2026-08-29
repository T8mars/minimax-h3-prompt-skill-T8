const assert = require('node:assert/strict');
const test = require('node:test');
const { userFacts, validateEnhancedPrompt } = require('../lib/prompt-validation.cjs');

test('ordinary sentence-initial commands are not treated as explicit user facts', () => {
  assert.deepEqual(
    userFacts('Create a five-second product proof: a fictional desk lamp visibly folds once.'),
    []
  );
});

test('quoted text, numbers, acronyms, and mixed-case identifiers remain explicit facts', () => {
  assert.deepEqual(
    userFacts('Create “NOVA” for 5 seconds with MiniMax and T8_case-01.'),
    ['NOVA', '5', 'MiniMax', 'T8_case-01']
  );
});

test('live-smoke shaped H3 output is not failed merely because it omits the command verb', () => {
  const report = validateEnhancedPrompt({
    target: 'minimaxH3',
    outputLanguage: 'en',
    intent: 'Create a five-second product proof: a fictional desk lamp visibly folds once, relights, and holds the final stable state.',
    output: 'Shot 1, 0-2 seconds: wide camera view of a fictional desk lamp; it folds once. Shot 2, 2-4 seconds: close-up as it relights. Shot 3, 4-5 seconds: locked camera holds the final stable state.',
    requiredAnchors: ['folds once', 'relights', 'held final stable state']
  });
  assert.notEqual(report.status, 'fail');
  assert.deepEqual(report.errors, []);
});

test('Chinese MiniMax H3 prose passes while preserving readable shot and camera structure', () => {
  const report = validateEnhancedPrompt({
    target: 'minimaxH3',
    outputLanguage: 'zh-CN',
    intent: '一台虚构折叠相机在五秒内证明折叠和亮灯功能。',
    output: 'integrated multimodal description: [Shot 1] 0-2秒，广角固定镜头展示一台虚构折叠相机完成一次折叠。[Shot 2] 2-4秒，近景跟拍相机重新亮灯。[Shot 3] 4-5秒，固定机位保持最终稳定结果。overall soundscape: 机械折叠声与轻微提示音。constraints: 保持同一产品身份，不出现字幕。',
    requiredAnchors: []
  });
  assert.notEqual(report.status, 'fail');
  assert.equal(report.outputLanguage, 'zh-CN');
  assert.deepEqual(report.errors, []);
});

test('creative-plan validation reports shot and continuity realization separately', () => {
  const report = validateEnhancedPrompt({
    target: 'minimaxH3',
    outputLanguage: 'zh-CN',
    intent: '“SOLVERA”产品在30秒内完成证据递进。',
    output: 'Shot 1 0-8秒：固定广角展示 SOLVERA 的完整轮廓和银色金属外壳。Shot 2 8-22秒：跟拍产品完成三项功能证明。Shot 3 22-30秒：镜头回到相同的 SOLVERA 银色金属外壳并停留。',
    requiredAnchors: [],
    creativePlan: {
      shots: [
        { shotId: 'opening', startSeconds: 0, endSeconds: 8, action: '展示完整轮廓', camera: '固定广角' },
        { shotId: 'proof', startSeconds: 8, endSeconds: 22, action: '完成三项功能证明', camera: '跟拍' },
        { shotId: 'finish', startSeconds: 22, endSeconds: 30, action: '回到相同产品并停留', camera: '' }
      ],
      continuityLocks: [{ entityId: 'product', name: 'SOLVERA', invariants: '银色金属外壳' }]
    }
  });
  assert.equal(report.shotCoverage, 1);
  assert.equal(report.continuityCoverage, 1);
  assert.equal(report.shotTrace.length, 3);
});

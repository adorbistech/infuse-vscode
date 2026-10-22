/**
 * Simple test runner for INFUSE VS Code adapter test suite.
 */

type TestFn = () => void | Promise<void>;

interface TestSuite {
  name: string;
  tests: { name: string; fn: TestFn }[];
}

const suites: TestSuite[] = [];
let currentSuite: TestSuite | null = null;

(global as any).describe = (name: string, fn: () => void) => {
  const suite: TestSuite = { name, tests: [] };
  currentSuite = suite;
  suites.push(suite);
  fn();
  currentSuite = null;
};

(global as any).it = (name: string, fn: TestFn) => {
  if (currentSuite) {
    currentSuite.tests.push({ name, fn });
  }
};

async function run(): Promise<void> {
  console.log('============================================================');
  console.log('INFUSE VS Code Adapter — Test Suite Execution');
  console.log('============================================================\n');

  // Load unit and mock tests
  require('./unit.test');

  // Only load live endpoint integration tests if explicitly requested
  if (process.env.INFUSE_LIVE_TEST === 'true') {
    require('./liveEndpoint.test');
  }

  let passed = 0;
  let failed = 0;
  const startTime = Date.now();

  for (const suite of suites) {
    console.log(`\n📦 Suite: ${suite.name}`);
    for (const test of suite.tests) {
      process.stdout.write(`  ⏳ ${test.name} ... `);
      const testStart = Date.now();
      try {
        await test.fn();
        const duration = Date.now() - testStart;
        console.log(`✅ PASS (${duration}ms)`);
        passed++;
      } catch (err: any) {
        const duration = Date.now() - testStart;
        console.log(`❌ FAIL (${duration}ms)`);
        console.error(`     Error: ${err.message || err}`);
        if (err.stack) {
          console.error(`     ${err.stack.split('\n').slice(1, 4).join('\n     ')}`);
        }
        failed++;
      }
    }
  }

  const totalTime = Date.now() - startTime;
  console.log('\n------------------------------------------------------------');
  console.log(`Summary: ${passed} passed, ${failed} failed in ${totalTime}ms`);
  console.log('============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});

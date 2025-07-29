import { NextRequest, NextResponse } from 'next/server';
import { testRunner } from '@/lib/test-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        return NextResponse.json({
          isRunning: testRunner.isTestRunning(),
          latestResults: testRunner.getLatestResults(),
          history: testRunner.getTestHistory().slice(-3) // Last 3 runs
        });

      case 'history':
        return NextResponse.json({
          history: testRunner.getTestHistory()
        });

      case 'latest':
        const latest = testRunner.getLatestResults();
        if (!latest) {
          return NextResponse.json(
            { error: 'No test results available' },
            { status: 404 }
          );
        }
        return NextResponse.json({ results: latest });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[TESTING API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'run':
        if (testRunner.isTestRunning()) {
          return NextResponse.json(
            { error: 'Tests are already running' },
            { status: 409 }
          );
        }

        // Run tests asynchronously
        testRunner.runFullTestSuite().catch(error => {
          console.error('[TESTING] Test suite failed:', error);
        });

        return NextResponse.json({
          message: 'Test suite started',
          status: 'running'
        });

      case 'stop':
        // In a real implementation, you'd have a way to stop running tests
        return NextResponse.json({
          message: 'Stop functionality not implemented',
          status: 'not_supported'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[TESTING API] Action error:', error);
    return NextResponse.json(
      { error: 'Failed to execute action' },
      { status: 500 }
    );
  }
}
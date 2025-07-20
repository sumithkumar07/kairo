import { NextRequest, NextResponse } from 'next/server';
import { ConnectorBuilder, CONNECTOR_TEMPLATES } from '@/lib/connector-builder';

/**
 * Test Integration Connection
 * POST /api/integrations/test
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectorId, credentials } = body;
    
    if (!connectorId || !credentials) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Connector ID and credentials are required' 
        },
        { status: 400 }
      );
    }
    
    // Find connector template
    const connector = CONNECTOR_TEMPLATES.find(c => c.id === connectorId);
    if (!connector) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Connector not found' 
        },
        { status: 404 }
      );
    }
    
    // Test connection
    const testResult = await ConnectorBuilder.testConnector(connector, credentials);
    
    return NextResponse.json({
      success: testResult.success,
      data: testResult.data,
      error: testResult.error
    });
    
  } catch (error) {
    console.error('Integration test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test integration',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Execute Integration Action
 * POST /api/integrations/execute
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectorId, actionId, parameters, credentials } = body;
    
    if (!connectorId || !actionId || !credentials) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Connector ID, action ID, and credentials are required' 
        },
        { status: 400 }
      );
    }
    
    // Find connector template
    const connector = CONNECTOR_TEMPLATES.find(c => c.id === connectorId);
    if (!connector) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Connector not found' 
        },
        { status: 404 }
      );
    }
    
    // Execute action
    const result = await ConnectorBuilder.executeAction(
      connector, 
      actionId, 
      parameters || {},
      credentials
    );
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Integration execution error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute integration action',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
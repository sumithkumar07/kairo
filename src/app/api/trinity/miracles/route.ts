import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import type { Miracle, CreateMiraculoRequest, PurchaseMiraculoRequest } from '@/types/trinity';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING,
});

// GET /api/trinity/miracles - Browse the Divine Marketplace
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const divine = searchParams.get('divine') === 'true';
    const sortBy = searchParams.get('sortBy') || 'karma_score'; // karma_score, price_usd, total_sales
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT m.*, u.email as creator_email,
             COUNT(mkv.id) as total_reviews,
             AVG(mkv.karma_rating) as avg_karma_rating
      FROM miracles m
      JOIN users u ON m.creator_id = u.id
      LEFT JOIN miracle_karma_votes mkv ON m.id = mkv.miracle_id
      WHERE m.status = 'active'
    `;
    
    const params: any[] = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND m.category = $${paramCount}`;
      params.push(category);
    }

    if (featured) {
      query += ` AND m.is_featured = true`;
    }

    if (divine) {
      query += ` AND m.is_divine = true`;
    }

    query += ` GROUP BY m.id, u.email`;

    // Add sorting
    const validSortColumns = ['karma_score', 'price_usd', 'total_sales', 'created_at'];
    if (validSortColumns.includes(sortBy)) {
      query += ` ORDER BY m.${sortBy} DESC`;
    } else {
      query += ` ORDER BY m.karma_score DESC`;
    }

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    const miracles = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      miracle_type: row.miracle_type,
      creator_id: row.creator_id,
      creator_email: row.creator_email,
      workflow_data: row.workflow_data,
      price_usd: parseFloat(row.price_usd),
      price_btc: row.price_btc ? parseFloat(row.price_btc) : null,
      karma_score: parseFloat(row.karma_score),
      total_sales: row.total_sales,
      total_revenue: parseFloat(row.total_revenue),
      kairo_commission_rate: parseFloat(row.kairo_commission_rate),
      category: row.category,
      tags: row.tags,
      is_featured: row.is_featured,
      is_divine: row.is_divine,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      total_reviews: parseInt(row.total_reviews),
      avg_karma_rating: row.avg_karma_rating ? parseFloat(row.avg_karma_rating) : null
    }));

    return NextResponse.json({
      miracles,
      meta: {
        total: miracles.length,
        limit,
        offset,
        marketplace_status: "DIVINE_COMMERCE_ACTIVE",
        divine_message: "Behold the miracles of mortals elevated to divine status"
      }
    });

  } catch (error: any) {
    console.error('[MIRACLE MARKETPLACE] Error fetching miracles:', error);
    return NextResponse.json(
      { error: 'The Divine Marketplace is temporarily transcending reality', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/trinity/miracles - Create a new miracle for the marketplace
export async function POST(request: NextRequest) {
  try {
    const body: CreateMiraculoRequest = await request.json();
    
    if (!body.title || !body.description || !body.miracle_type || !body.workflow_data || !body.price_usd || !body.category) {
      return NextResponse.json(
        { error: 'Divine miracles require title, description, type, workflow_data, price, and category' },
        { status: 400 }
      );
    }

    // Validate miracle type
    const validTypes = ['workflow', 'template', 'integration', 'emergency_fix'];
    if (!validTypes.includes(body.miracle_type)) {
      return NextResponse.json(
        { error: 'Invalid miracle type. Must be workflow, template, integration, or emergency_fix' },
        { status: 400 }
      );
    }

    const miracleId = uuidv4();
    
    // Mock creator ID - replace with actual auth
    const creatorId = uuidv4();

    // Determine if this is a deity-tier miracle
    const isDivine = body.price_usd > 10000 || body.price_btc || body.miracle_type === 'emergency_fix';

    const insertQuery = `
      INSERT INTO miracles (
        id, title, description, miracle_type, creator_id, workflow_data,
        price_usd, price_btc, category, tags, is_divine, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      miracleId,
      body.title,
      body.description,
      body.miracle_type,
      creatorId,
      JSON.stringify(body.workflow_data),
      body.price_usd,
      body.price_btc || null,
      body.category,
      body.tags || [],
      isDivine,
      'active'
    ]);

    const miracle = result.rows[0];

    return NextResponse.json({
      miracle: {
        id: miracle.id,
        title: miracle.title,
        description: miracle.description,
        miracle_type: miracle.miracle_type,
        creator_id: miracle.creator_id,
        workflow_data: miracle.workflow_data,
        price_usd: parseFloat(miracle.price_usd),
        price_btc: miracle.price_btc ? parseFloat(miracle.price_btc) : null,
        karma_score: parseFloat(miracle.karma_score),
        total_sales: miracle.total_sales,
        total_revenue: parseFloat(miracle.total_revenue),
        kairo_commission_rate: parseFloat(miracle.kairo_commission_rate),
        category: miracle.category,
        tags: miracle.tags,
        is_featured: miracle.is_featured,
        is_divine: miracle.is_divine,
        status: miracle.status,
        created_at: miracle.created_at,
        updated_at: miracle.updated_at
      },
      divine_message: isDivine ? 
        "Your miracle has achieved DIVINE status! The gods smile upon your creation." :
        "Your miracle has been blessed and enters the marketplace.",
      marketplace_id: `MKT_${miracleId.slice(0, 8)}`
    });

  } catch (error: any) {
    console.error('[MIRACLE MARKETPLACE] Error creating miracle:', error);
    return NextResponse.json(
      { error: 'The Divine Marketplace rejected your offering', details: error.message },
      { status: 500 }
    );
  }
}
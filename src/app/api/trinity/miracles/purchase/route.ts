import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import type { PurchaseMiraculoRequest } from '@/types/trinity';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING,
});

// POST /api/trinity/miracles/purchase - Purchase a miracle from the marketplace
export async function POST(request: NextRequest) {
  try {
    const body: PurchaseMiraculoRequest = await request.json();
    
    if (!body.miracle_id || !body.payment_method) {
      return NextResponse.json(
        { error: 'Miracle ID and payment method are required for divine transactions' },
        { status: 400 }
      );
    }

    // Get miracle details
    const miracleResult = await pool.query(
      'SELECT * FROM miracles WHERE id = $1 AND status = $2',
      [body.miracle_id, 'active']
    );

    if (miracleResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Miracle not found or no longer available in the divine marketplace' },
        { status: 404 }
      );
    }

    const miracle = miracleResult.rows[0];
    
    // Mock buyer ID - replace with actual auth
    const buyerId = uuidv4();
    
    // Calculate pricing
    const priceUsd = parseFloat(miracle.price_usd);
    const priceBtc = miracle.price_btc ? parseFloat(miracle.price_btc) : null;
    const commissionRate = parseFloat(miracle.kairo_commission_rate);
    const kairoCommission = priceUsd * commissionRate;
    const creatorEarnings = priceUsd - kairoCommission;

    const purchaseId = uuidv4();

    // Record the purchase
    const insertPurchaseQuery = `
      INSERT INTO miracle_purchases (
        id, miracle_id, buyer_id, creator_id, price_paid_usd, price_paid_btc,
        kairo_commission, creator_earnings, transaction_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const purchaseResult = await pool.query(insertPurchaseQuery, [
      purchaseId,
      body.miracle_id,
      buyerId,
      miracle.creator_id,
      priceUsd,
      priceBtc,
      kairoCommission,
      creatorEarnings,
      body.transaction_hash || null
    ]);

    // Update miracle statistics
    await pool.query(`
      UPDATE miracles 
      SET total_sales = total_sales + 1,
          total_revenue = total_revenue + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [priceUsd, body.miracle_id]);

    const purchase = purchaseResult.rows[0];

    return NextResponse.json({
      purchase: {
        id: purchase.id,
        miracle_id: purchase.miracle_id,
        buyer_id: purchase.buyer_id,
        creator_id: purchase.creator_id,
        price_paid_usd: parseFloat(purchase.price_paid_usd),
        price_paid_btc: purchase.price_paid_btc ? parseFloat(purchase.price_paid_btc) : null,
        kairo_commission: parseFloat(purchase.kairo_commission),
        creator_earnings: parseFloat(purchase.creator_earnings),
        transaction_hash: purchase.transaction_hash,
        purchased_at: purchase.purchased_at
      },
      miracle_data: miracle.workflow_data,
      divine_message: miracle.is_divine ? 
        "🌟 DIVINE MIRACLE ACQUIRED! Reality bends to your will." :
        "✨ Miracle successfully purchased! May its power serve you well.",
      deployment_instructions: "Deploy this miracle using the Kairo workflow engine",
      karma_blessing: `+${Math.floor(Math.random() * 100 + 50)} Automation Karma Points`
    });

  } catch (error: any) {
    console.error('[MIRACLE MARKETPLACE] Error purchasing miracle:', error);
    return NextResponse.json(
      { error: 'Divine transaction failed. The gods demand payment in different form.', details: error.message },
      { status: 500 }
    );
  }
}
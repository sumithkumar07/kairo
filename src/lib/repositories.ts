import { z } from 'zod';
import { dbManager, QueryBuilder } from './database-enhanced';

// Base model interface
export interface BaseModel {
  id: string;
  created_at: Date;
  updated_at: Date;
}

// User models and schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().max(255),
  password_hash: z.string(),
  created_at: z.date(),
  updated_at: z.date()
});

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  subscription_tier: z.enum(['Free', 'Gold', 'Diamond', 'Trial']),
  trial_end_date: z.date().nullable(),
  monthly_workflow_runs: z.number().int().min(0).default(0),
  monthly_ai_generations: z.number().int().min(0).default(0),
  created_at: z.date(),
  updated_at: z.date()
});

export const WorkflowSchema = z.object({
  user_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  workflow_data: z.record(z.any()),
  created_at: z.date(),
  updated_at: z.date()
});

export const RunHistorySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  workflow_name: z.string().max(255),
  timestamp: z.date(),
  status: z.enum(['success', 'error', 'running', 'cancelled']),
  execution_result: z.record(z.any()).nullable(),
  initial_data: z.record(z.any()).nullable(),
  workflow_snapshot: z.record(z.any()).nullable(),
  execution_time_ms: z.number().int().min(0).nullable(),
  error_message: z.string().nullable()
});

export type User = z.infer<typeof UserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type RunHistory = z.infer<typeof RunHistorySchema>;

// Base repository class
export abstract class BaseRepository<T extends BaseModel> {
  protected tableName: string;
  protected schema: z.ZodSchema<T>;

  constructor(tableName: string, schema: z.ZodSchema<T>) {
    this.tableName = tableName;
    this.schema = schema;
  }

  // Validate data against schema
  protected validate(data: Partial<T>): T {
    return this.schema.parse(data);
  }

  // Safe data parsing with error handling
  protected safeValidate(data: any): { success: true; data: T } | { success: false; error: string } {
    try {
      const validatedData = this.schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return { success: false, error: errorMessage };
      }
      return { success: false, error: 'Validation failed' };
    }
  }

  // Find by ID
  async findById(id: string): Promise<T | null> {
    try {
      const result = await QueryBuilder
        .select()
        .from(this.tableName)
        .where('id = ?', id)
        .execute();

      if (result.length === 0) return null;

      const validation = this.safeValidate(result[0]);
      return validation.success ? validation.data : null;
    } catch (error) {
      console.error(`[REPOSITORY] Error finding ${this.tableName} by ID:`, error);
      throw error;
    }
  }

  // Find all with pagination
  async findAll(options: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    where?: Record<string, any>;
  } = {}): Promise<{ data: T[]; total: number }> {
    try {
      const {
        limit = 10,
        offset = 0,
        orderBy = 'created_at',
        orderDirection = 'DESC',
        where = {}
      } = options;

      let query = QueryBuilder.select().from(this.tableName);

      // Apply where conditions
      Object.entries(where).forEach(([key, value]) => {
        query = query.where(`${key} = ?`, value);
      });

      // Get total count
      const countQuery = QueryBuilder
        .select('COUNT(*) as count')
        .from(this.tableName);

      Object.entries(where).forEach(([key, value]) => {
        countQuery.where(`${key} = ?`, value);
      });

      const countResult = await countQuery.execute<{ count: string }>();
      const total = parseInt(countResult[0]?.count || '0');

      // Get data with pagination
      const data = await query
        .orderBy(orderBy, orderDirection)
        .limit(limit)
        .offset(offset)
        .execute();

      // Validate all results
      const validatedData: T[] = [];
      for (const item of data) {
        const validation = this.safeValidate(item);
        if (validation.success) {
          validatedData.push(validation.data);
        }
      }

      return { data: validatedData, total };
    } catch (error) {
      console.error(`[REPOSITORY] Error finding all ${this.tableName}:`, error);
      throw error;
    }
  }

  // Create new record
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    try {
      const result = await QueryBuilder
        .insert(this.tableName)
        .values({
          ...data,
          id: crypto.randomUUID(),
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning()
        .execute();

      if (result.length === 0) {
        throw new Error(`Failed to create ${this.tableName}`);
      }

      return this.validate(result[0]);
    } catch (error) {
      console.error(`[REPOSITORY] Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  // Update existing record
  async update(id: string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T | null> {
    try {
      const result = await QueryBuilder
        .update(this.tableName)
        .set({
          ...data,
          updated_at: new Date()
        })
        .where('id = ?', id)
        .returning()
        .execute();

      if (result.length === 0) return null;

      return this.validate(result[0]);
    } catch (error) {
      console.error(`[REPOSITORY] Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  // Delete record
  async delete(id: string): Promise<boolean> {
    try {
      const result = await QueryBuilder
        .delete(this.tableName)
        .where('id = ?', id)
        .execute();

      return result.length > 0;
    } catch (error) {
      console.error(`[REPOSITORY] Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  // Soft delete (if applicable)
  async softDelete(id: string): Promise<T | null> {
    try {
      const result = await QueryBuilder
        .update(this.tableName)
        .set({
          deleted_at: new Date(),
          updated_at: new Date()
        })
        .where('id = ?', id)
        .returning()
        .execute();

      if (result.length === 0) return null;

      return this.validate(result[0]);
    } catch (error) {
      console.error(`[REPOSITORY] Error soft deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  // Bulk operations
  async bulkCreate(items: Array<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T[]> {
    try {
      const results: T[] = [];

      await dbManager.executeTransaction(async (client) => {
        for (const item of items) {
          const result = await QueryBuilder
            .insert(this.tableName)
            .values({
              ...item,
              id: crypto.randomUUID(),
              created_at: new Date(),
              updated_at: new Date()
            })
            .returning()
            .execute();

          if (result.length > 0) {
            results.push(this.validate(result[0]));
          }
        }
      });

      return results;
    } catch (error) {
      console.error(`[REPOSITORY] Error bulk creating ${this.tableName}:`, error);
      throw error;
    }
  }
}

// User Repository
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users', UserSchema);
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await QueryBuilder
        .select()
        .from(this.tableName)
        .where('email = ?', email.toLowerCase())
        .execute();

      if (result.length === 0) return null;

      const validation = this.safeValidate(result[0]);
      return validation.success ? validation.data : null;
    } catch (error) {
      console.error('[USER_REPOSITORY] Error finding user by email:', error);
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await QueryBuilder
        .update(this.tableName)
        .set({ 
          last_login: new Date(),
          updated_at: new Date()
        })
        .where('id = ?', id)
        .execute();
    } catch (error) {
      console.error('[USER_REPOSITORY] Error updating last login:', error);
      throw error;
    }
  }
}

// Workflow Repository
export class WorkflowRepository extends BaseRepository<Workflow> {
  constructor() {
    super('workflows', WorkflowSchema);
  }

  async findByUser(userId: string, options: {
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<{ data: Workflow[]; total: number }> {
    try {
      const { limit = 10, offset = 0, search } = options;

      let query = QueryBuilder
        .select()
        .from(this.tableName)
        .where('user_id = ?', userId);

      if (search) {
        query = query.where('name ILIKE ?', `%${search}%`);
      }

      const countQuery = QueryBuilder
        .select('COUNT(*) as count')
        .from(this.tableName)
        .where('user_id = ?', userId);

      if (search) {
        countQuery.where('name ILIKE ?', `%${search}%`);
      }

      const [data, countResult] = await Promise.all([
        query
          .orderBy('updated_at', 'DESC')
          .limit(limit)
          .offset(offset)
          .execute(),
        countQuery.execute<{ count: string }>()
      ]);

      const total = parseInt(countResult[0]?.count || '0');
      const validatedData: Workflow[] = [];

      for (const item of data) {
        const validation = this.safeValidate(item);
        if (validation.success) {
          validatedData.push(validation.data);
        }
      }

      return { data: validatedData, total };
    } catch (error) {
      console.error('[WORKFLOW_REPOSITORY] Error finding workflows by user:', error);
      throw error;
    }
  }

  async findByUserAndName(userId: string, name: string): Promise<Workflow | null> {
    try {
      const result = await QueryBuilder
        .select()
        .from(this.tableName)
        .where('user_id = ?', userId)
        .where('name = ?', name)
        .execute();

      if (result.length === 0) return null;

      const validation = this.safeValidate(result[0]);
      return validation.success ? validation.data : null;
    } catch (error) {
      console.error('[WORKFLOW_REPOSITORY] Error finding workflow by user and name:', error);
      throw error;
    }
  }
}

// Run History Repository
export class RunHistoryRepository extends BaseRepository<RunHistory> {
  constructor() {
    super('run_history', RunHistorySchema);
  }

  async findByUser(userId: string, options: {
    limit?: number;
    offset?: number;
    status?: string;
    workflowName?: string;
    dateFrom?: Date;
    dateTo?: Date;
  } = {}): Promise<{ data: RunHistory[]; total: number }> {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        status, 
        workflowName, 
        dateFrom, 
        dateTo 
      } = options;

      let query = QueryBuilder
        .select()
        .from(this.tableName)
        .where('user_id = ?', userId);

      let countQuery = QueryBuilder
        .select('COUNT(*) as count')
        .from(this.tableName)
        .where('user_id = ?', userId);

      if (status) {
        query = query.where('status = ?', status);
        countQuery = countQuery.where('status = ?', status);
      }

      if (workflowName) {
        query = query.where('workflow_name = ?', workflowName);
        countQuery = countQuery.where('workflow_name = ?', workflowName);
      }

      if (dateFrom) {
        query = query.where('timestamp >= ?', dateFrom);
        countQuery = countQuery.where('timestamp >= ?', dateFrom);
      }

      if (dateTo) {
        query = query.where('timestamp <= ?', dateTo);
        countQuery = countQuery.where('timestamp <= ?', dateTo);
      }

      const [data, countResult] = await Promise.all([
        query
          .orderBy('timestamp', 'DESC')
          .limit(limit)
          .offset(offset)
          .execute(),
        countQuery.execute<{ count: string }>()
      ]);

      const total = parseInt(countResult[0]?.count || '0');
      const validatedData: RunHistory[] = [];

      for (const item of data) {
        const validation = this.safeValidate(item);
        if (validation.success) {
          validatedData.push(validation.data);
        }
      }

      return { data: validatedData, total };
    } catch (error) {
      console.error('[RUN_HISTORY_REPOSITORY] Error finding run history by user:', error);
      throw error;
    }
  }

  async getExecutionStats(userId: string, period: 'day' | 'week' | 'month' = 'day'): Promise<{
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageExecutionTime: number;
    successRate: number;
  }> {
    try {
      const periodMap = {
        day: '24 hours',
        week: '7 days',
        month: '30 days'
      };

      const result = await dbManager.executeQuery(`
        SELECT 
          COUNT(*) as total_runs,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_runs,
          COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_runs,
          AVG(execution_time_ms) as avg_execution_time
        FROM run_history 
        WHERE user_id = $1 
        AND timestamp > NOW() - INTERVAL '${periodMap[period]}'
      `, [userId]);

      const stats = result[0] || {};
      const totalRuns = parseInt(stats.total_runs || '0');
      const successfulRuns = parseInt(stats.successful_runs || '0');
      const failedRuns = parseInt(stats.failed_runs || '0');
      const averageExecutionTime = parseFloat(stats.avg_execution_time || '0');
      const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

      return {
        totalRuns,
        successfulRuns,
        failedRuns,
        averageExecutionTime,
        successRate
      };
    } catch (error) {
      console.error('[RUN_HISTORY_REPOSITORY] Error getting execution stats:', error);
      throw error;
    }
  }
}

// Repository factory
export class RepositoryFactory {
  private static userRepo: UserRepository;
  private static workflowRepo: WorkflowRepository;
  private static runHistoryRepo: RunHistoryRepository;

  static getUserRepository(): UserRepository {
    if (!this.userRepo) {
      this.userRepo = new UserRepository();
    }
    return this.userRepo;
  }

  static getWorkflowRepository(): WorkflowRepository {
    if (!this.workflowRepo) {
      this.workflowRepo = new WorkflowRepository();
    }
    return this.workflowRepo;
  }

  static getRunHistoryRepository(): RunHistoryRepository {
    if (!this.runHistoryRepo) {
      this.runHistoryRepo = new RunHistoryRepository();
    }
    return this.runHistoryRepo;
  }
}

// Export repositories
export const userRepository = RepositoryFactory.getUserRepository();
export const workflowRepository = RepositoryFactory.getWorkflowRepository();
export const runHistoryRepository = RepositoryFactory.getRunHistoryRepository();
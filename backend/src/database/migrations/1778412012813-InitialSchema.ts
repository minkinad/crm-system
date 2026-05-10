import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1778412012813 implements MigrationInterface {
    name = 'InitialSchema1778412012813'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('Admin', 'Manager', 'Sales', 'Viewer')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "tenantId" uuid NOT NULL, "firstName" character varying(120) NOT NULL, "lastName" character varying(120) NOT NULL, "email" character varying(180) NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'Viewer', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c58f7e88c286e5e3478960a998" ON "users" ("tenantId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7346b08032078107fce81e014f" ON "users" ("tenantId", "email") `);
        await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('Open', 'InProgress', 'Done', 'Cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('Low', 'Medium', 'High', 'Urgent')`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "tenantId" uuid NOT NULL, "title" character varying(180) NOT NULL, "description" text, "dueDate" TIMESTAMP WITH TIME ZONE, "reminderAt" TIMESTAMP WITH TIME ZONE, "ownerId" uuid, "relatedDealId" uuid, "relatedContactId" uuid, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'Open', "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'Medium', CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fff681d315d607f9f03e0a434d" ON "tasks" ("tenantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d7f2862e63a7dfb5655acf10f7" ON "tasks" ("tenantId", "ownerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_244d5fa711622ef77714298dd8" ON "tasks" ("tenantId", "dueDate") `);
        await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying(120) NOT NULL, "slug" character varying(80) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2310ecc5cb8be427097154b18f" ON "tenants" ("slug") `);
        await queryRunner.query(`CREATE TYPE "public"."deals_stage_enum" AS ENUM('Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost')`);
        await queryRunner.query(`CREATE TYPE "public"."deals_status_enum" AS ENUM('Open', 'Won', 'Lost')`);
        await queryRunner.query(`CREATE TABLE "deals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "tenantId" uuid NOT NULL, "title" character varying(180) NOT NULL, "value" numeric(14,2) NOT NULL DEFAULT '0', "currency" character varying(8) NOT NULL DEFAULT 'USD', "stage" "public"."deals_stage_enum" NOT NULL DEFAULT 'Lead', "status" "public"."deals_status_enum" NOT NULL DEFAULT 'Open', "pipeline" character varying(80) NOT NULL DEFAULT 'Default', "expectedCloseDate" date, "accountId" uuid, "contactId" uuid, "ownerId" uuid, "description" text, CONSTRAINT "PK_8c66f03b250f613ff8615940b4b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_298c40a60de3b1c7a852800bcf" ON "deals" ("tenantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5a4aba5fd02396633667adbc2e" ON "deals" ("tenantId", "pipeline") `);
        await queryRunner.query(`CREATE INDEX "IDX_877b5d0bc64532f993cee2a302" ON "deals" ("tenantId", "stage") `);
        await queryRunner.query(`CREATE TYPE "public"."deal_stage_history_fromstage_enum" AS ENUM('Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost')`);
        await queryRunner.query(`CREATE TYPE "public"."deal_stage_history_tostage_enum" AS ENUM('Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost')`);
        await queryRunner.query(`CREATE TABLE "deal_stage_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "tenantId" uuid NOT NULL, "dealId" uuid NOT NULL, "fromStage" "public"."deal_stage_history_fromstage_enum", "toStage" "public"."deal_stage_history_tostage_enum" NOT NULL, "changedBy" uuid, "reason" text, CONSTRAINT "PK_92a1807e6b5c2694b06a430f77d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a4c529c729fd85514e46d31bf3" ON "deal_stage_history" ("tenantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_eeaa809897e96e54abe5b8fab9" ON "deal_stage_history" ("tenantId", "dealId") `);
        await queryRunner.query(`CREATE TABLE "contacts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "tenantId" uuid NOT NULL, "firstName" character varying(120) NOT NULL, "lastName" character varying(120) NOT NULL, "email" character varying(180), "phone" character varying(60), "position" character varying(120), "accountId" uuid, "ownerId" uuid, CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fd4581e6471df98b5d8d14a634" ON "contacts" ("tenantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_edf68a86c61af0cf1a61f68185" ON "contacts" ("tenantId", "accountId") `);
        await queryRunner.query(`CREATE INDEX "IDX_48c9d805574c82dfb845150cf4" ON "contacts" ("tenantId", "email") `);
        await queryRunner.query(`CREATE TYPE "public"."comments_targettype_enum" AS ENUM('Account', 'Contact', 'Deal', 'Task')`);
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "tenantId" uuid NOT NULL, "authorId" uuid NOT NULL, "targetType" "public"."comments_targettype_enum" NOT NULL, "targetId" uuid NOT NULL, "body" text NOT NULL, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b2173448029ca5aa1ac004cd25" ON "comments" ("tenantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a73ea5ec341218abcafce35421" ON "comments" ("tenantId", "targetType", "targetId") `);
        await queryRunner.query(`CREATE TABLE "auth_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "tenantId" uuid NOT NULL, "userId" uuid NOT NULL, "refreshTokenHash" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_641507381f32580e8479efc36cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0d53fa21a0357abc6d6b42dc49" ON "auth_sessions" ("tenantId", "userId") `);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "tenantId" uuid, "userId" uuid, "action" character varying(200) NOT NULL, "resource" character varying(200) NOT NULL, "metadata" jsonb, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f09b40d69c2488932373effd4e" ON "audit_logs" ("tenantId", "createdAt") `);
        await queryRunner.query(`CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "tenantId" uuid NOT NULL, "name" character varying(180) NOT NULL, "industry" character varying(120), "website" character varying(180), "description" text, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_400028436681d655ad3cd56354" ON "accounts" ("tenantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6903e380236e43563554022576" ON "accounts" ("tenantId", "name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_6903e380236e43563554022576"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_400028436681d655ad3cd56354"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f09b40d69c2488932373effd4e"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d53fa21a0357abc6d6b42dc49"`);
        await queryRunner.query(`DROP TABLE "auth_sessions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a73ea5ec341218abcafce35421"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2173448029ca5aa1ac004cd25"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TYPE "public"."comments_targettype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_48c9d805574c82dfb845150cf4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_edf68a86c61af0cf1a61f68185"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd4581e6471df98b5d8d14a634"`);
        await queryRunner.query(`DROP TABLE "contacts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eeaa809897e96e54abe5b8fab9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a4c529c729fd85514e46d31bf3"`);
        await queryRunner.query(`DROP TABLE "deal_stage_history"`);
        await queryRunner.query(`DROP TYPE "public"."deal_stage_history_tostage_enum"`);
        await queryRunner.query(`DROP TYPE "public"."deal_stage_history_fromstage_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_877b5d0bc64532f993cee2a302"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5a4aba5fd02396633667adbc2e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_298c40a60de3b1c7a852800bcf"`);
        await queryRunner.query(`DROP TABLE "deals"`);
        await queryRunner.query(`DROP TYPE "public"."deals_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."deals_stage_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2310ecc5cb8be427097154b18f"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_244d5fa711622ef77714298dd8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d7f2862e63a7dfb5655acf10f7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fff681d315d607f9f03e0a434d"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7346b08032078107fce81e014f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c58f7e88c286e5e3478960a998"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}

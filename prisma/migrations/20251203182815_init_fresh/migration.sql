-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CALL_AGENT', 'DOCTOR');

-- CreateEnum
CREATE TYPE "appointment_status" AS ENUM ('pending_payment', 'confirmed', 'cancelled', 'completed');

-- CreateTable
CREATE TABLE "appointments" (
    "appointment_id" BIGSERIAL NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "doctor_id" BIGINT NOT NULL,
    "hospital_id" BIGINT NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "status" "appointment_status" NOT NULL DEFAULT 'pending_payment',
    "payment_link" TEXT,
    "payment_confirmation_code" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "public_id" VARCHAR(12),

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "doctor_hospital_affiliations" (
    "affiliation_id" BIGSERIAL NOT NULL,
    "doctor_id" BIGINT NOT NULL,
    "hospital_id" BIGINT NOT NULL,

    CONSTRAINT "doctor_hospital_affiliations_pkey" PRIMARY KEY ("affiliation_id")
);

-- CreateTable
CREATE TABLE "doctor_schedules" (
    "schedule_id" BIGSERIAL NOT NULL,
    "doctor_id" BIGINT NOT NULL,
    "hospital_id" BIGINT NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "valid_from" DATE NOT NULL DEFAULT CURRENT_DATE,
    "valid_until" DATE,

    CONSTRAINT "doctor_schedules_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "doctor_id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "specialization_id" BIGINT,
    "profile_description" TEXT,
    "public_id" VARCHAR(12),
    "consultant_fee" DOUBLE PRECISION DEFAULT 0.0,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("doctor_id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "hospital_id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "city" VARCHAR(100),
    "phone_number" VARCHAR(20),
    "public_id" VARCHAR(12),

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("hospital_id")
);

-- CreateTable
CREATE TABLE "illness_specialization_map" (
    "illness_id" BIGSERIAL NOT NULL,
    "illness_name" VARCHAR(100) NOT NULL,
    "specialization_id" BIGINT,

    CONSTRAINT "illness_specialization_map_pkey" PRIMARY KEY ("illness_id")
);

-- CreateTable
CREATE TABLE "patients" (
    "patient_id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "nic" VARCHAR(20),

    CONSTRAINT "patients_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "specializations" (
    "specialization_id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("specialization_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CALL_AGENT',
    "status" VARCHAR(50) DEFAULT 'active',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointments_public_id_key" ON "appointments"("public_id");

-- CreateIndex
CREATE INDEX "idx_appointments_doctor_time" ON "appointments"("doctor_id", "start_time", "end_time");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_hospital_affiliations_doctor_id_hospital_id_key" ON "doctor_hospital_affiliations"("doctor_id", "hospital_id");

-- CreateIndex
CREATE INDEX "idx_schedules_doctor_day" ON "doctor_schedules"("doctor_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_schedules_doctor_id_hospital_id_day_of_week_start_ti_key" ON "doctor_schedules"("doctor_id", "hospital_id", "day_of_week", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_public_id_key" ON "doctors"("public_id");

-- CreateIndex
CREATE INDEX "idx_doctors_name" ON "doctors"("name");

-- CreateIndex
CREATE INDEX "idx_doctors_specialization" ON "doctors"("specialization_id");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_public_id_key" ON "hospitals"("public_id");

-- CreateIndex
CREATE INDEX "idx_hospitals_city" ON "hospitals"("city");

-- CreateIndex
CREATE UNIQUE INDEX "patients_nic_key" ON "patients"("nic");

-- CreateIndex
CREATE UNIQUE INDEX "specializations_name_key" ON "specializations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("hospital_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "doctor_hospital_affiliations" ADD CONSTRAINT "doctor_hospital_affiliations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "doctor_hospital_affiliations" ADD CONSTRAINT "doctor_hospital_affiliations_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("hospital_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("hospital_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("specialization_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "illness_specialization_map" ADD CONSTRAINT "illness_specialization_map_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("specialization_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COACH_PIN = "2507";
const METHODS = ["Cash", "PayNow", "Bank Transfer", "Card", "Other"];

async function verifyCoach(pin: string | null) {
  if (!pin || pin !== COACH_PIN) return null;
  return prisma.student.findUnique({ where: { pin: COACH_PIN } });
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfYear(d = new Date()) {
  return new Date(d.getFullYear(), 0, 1);
}

// GET /api/coach/admin/payments?pin=2507 — payments + revenue totals
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coach = await verifyCoach(searchParams.get("pin"));
    if (!coach) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      include: { student: { select: { id: true, name: true } } },
    });

    const now = new Date();
    const monthStart = startOfMonth(now).getTime();
    const yearStart = startOfYear(now).getTime();

    let allTime = 0;
    let thisMonth = 0;
    let thisYear = 0;
    const byStudentMap = new Map<number, { studentId: number; name: string; total: number; count: number }>();
    const monthlyMap = new Map<string, number>();

    for (const p of payments) {
      const amt = p.amount;
      const t = new Date(p.paidAt).getTime();
      allTime += amt;
      if (t >= monthStart) thisMonth += amt;
      if (t >= yearStart) thisYear += amt;

      const key = p.student?.id ?? 0;
      if (p.student) {
        const prev = byStudentMap.get(key) ?? { studentId: key, name: p.student.name, total: 0, count: 0 };
        prev.total += amt;
        prev.count += 1;
        byStudentMap.set(key, prev);
      }

      const d = new Date(p.paidAt);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(mKey, (monthlyMap.get(mKey) ?? 0) + amt);
    }

    // last 6 months, oldest -> newest
    const monthly: { month: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly.push({ month: key, total: Math.round((monthlyMap.get(key) ?? 0) * 100) / 100 });
    }

    const byStudent = Array.from(byStudentMap.values()).sort((a, b) => b.total - a.total);

    return NextResponse.json({
      payments,
      totals: {
        allTime: Math.round(allTime * 100) / 100,
        thisMonth: Math.round(thisMonth * 100) / 100,
        thisYear: Math.round(thisYear * 100) / 100,
        count: payments.length,
        avgPerPayment: payments.length ? Math.round((allTime / payments.length) * 100) / 100 : 0,
        payingStudents: byStudent.length,
      },
      byStudent,
      monthly,
    });
  } catch (error) {
    console.error("Coach payments GET error:", error);
    return NextResponse.json({ error: "Failed to load payments" }, { status: 500 });
  }
}

// POST /api/coach/admin/payments — log a payment received
// body: { pin, studentId, amount, sessions?, method?, note?, paidAt? }
export async function POST(request: Request) {
  try {
    const { pin, studentId, amount, sessions, method, note, paidAt } = await request.json();

    const coach = await verifyCoach(pin);
    if (!coach) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return NextResponse.json({ error: "Amount must be a number greater than 0" }, { status: 400 });
    }

    // studentId optional: omitted / "bulk" = unattributed month total
    const isBulk = studentId === undefined || studentId === null || studentId === "" || studentId === "bulk" || studentId === 0 || studentId === "0";
    let linkedStudentId: number | null = null;
    if (!isBulk) {
      const parsedId = parseInt(studentId);
      if (!Number.isFinite(parsedId)) {
        return NextResponse.json({ error: "Choose a student" }, { status: 400 });
      }
      const student = await prisma.student.findUnique({ where: { id: parsedId } });
      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      linkedStudentId = student.id;
    }

    let sess: number | null = null;
    if (sessions !== null && sessions !== undefined && sessions !== "") {
      const n = parseInt(sessions);
      if (!Number.isFinite(n) || n <= 0) {
        return NextResponse.json({ error: "Sessions must be a positive number" }, { status: 400 });
      }
      sess = n;
    }

    const payMethod = METHODS.includes(method) ? method : "PayNow";

    let when = new Date();
    if (paidAt) {
      const d = new Date(paidAt);
      if (!isNaN(d.getTime())) when = d;
    }

    const payment = await prisma.payment.create({
      data: {
        studentId: linkedStudentId,
        amount: Math.round(amt * 100) / 100,
        sessions: sess,
        method: payMethod,
        note: note && String(note).trim() ? String(note).trim() : (isBulk ? "Bulk month total" : null),
        paidAt: when,
      },
      include: { student: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error("Coach payments POST error:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}

// DELETE /api/coach/admin/payments — remove a payment entry
// body: { pin, paymentId }
export async function DELETE(request: Request) {
  try {
    const { pin, paymentId } = await request.json();

    const coach = await verifyCoach(pin);
    if (!coach) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }
    if (!paymentId) {
      return NextResponse.json({ error: "paymentId required" }, { status: 400 });
    }

    const deleted = await prisma.payment.deleteMany({ where: { id: parseInt(paymentId) } });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Coach payments DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// 注册中文字体（使用系统字体回退，无需额外字体文件）
// @react-pdf/renderer 默认不支持中文，需要注册字体
// 这里使用内嵌方案：将中文转为 Unicode 转义
// 实际生产中需要注册 Noto Sans SC 等字体文件

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0d0d0d",
    color: "#f0f0f0",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#e8ff3a",
  },
  headerLeft: { flex: 1 },
  badge: {
    backgroundColor: "#e8ff3a",
    color: "#0d0d0d",
    fontSize: 8,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  name: { fontSize: 26, fontWeight: "bold", color: "#f0f0f0", marginBottom: 4 },
  subInfo: { fontSize: 9, color: "#888888" },
  reportLabel: { fontSize: 8, color: "#555555", textAlign: "right", marginBottom: 4 },
  reportDate: { fontSize: 9, color: "#e8ff3a", textAlign: "right" },

  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#888888",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  accentBar: {
    width: 3,
    height: 10,
    backgroundColor: "#e8ff3a",
    marginRight: 6,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statBox: {
    width: "30%",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    padding: 10,
    marginBottom: 8,
  },
  statLabel: { fontSize: 7, color: "#555555", letterSpacing: 1, marginBottom: 3 },
  statValue: { fontSize: 16, fontWeight: "bold", color: "#e8ff3a", fontFamily: "Helvetica-Bold" },
  statUnit: { fontSize: 7, color: "#555555" },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  tableCell: { fontSize: 8, color: "#f0f0f0", flex: 1 },
  tableHeaderCell: { fontSize: 7, color: "#555555", flex: 1, letterSpacing: 1 },
  tableValueCell: { fontSize: 8, color: "#e8ff3a", flex: 1, fontFamily: "Helvetica-Bold" },

  logEntry: {
    backgroundColor: "#141414",
    borderLeftWidth: 2,
    borderLeftColor: "#e8ff3a",
    padding: 8,
    marginBottom: 6,
  },
  logDate: { fontSize: 8, color: "#e8ff3a", fontFamily: "Helvetica-Bold", marginBottom: 3 },
  logContent: { fontSize: 8, color: "#888888" },
  logMeta: { fontSize: 7, color: "#555555", marginTop: 2 },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: "#555555" },
});

type AthleteData = {
  id: number;
  name: string;
  gender: string;
  age: number;
  nationality: string;
  sport: string;
  position: string | null;
  team: string | null;
  coachName: string | null;
  height: number | null;
  weight: number | null;
  status: string;
  strengthRecords: Array<{
    recordDate: Date;
    squat: number | null;
    deadlift: number | null;
    benchPress: number | null;
    powerClean: number | null;
    snatch: number | null;
    cleanJerk: number | null;
  }>;
  physicalTests: Array<{
    testDate: Date;
    sprint100m: number | null;
    sprint50m: number | null;
    run3000m: number | null;
    vo2max: number | null;
    verticalJump: number | null;
    broadJump: number | null;
    overallScore: number | null;
  }>;
  bodyCompositions: Array<{
    testDate: Date;
    weight: number | null;
    bodyFat: number | null;
    muscleMass: number | null;
    bmi: number | null;
    visceralFat: number | null;
  }>;
  trainingLogs: Array<{
    date: Date;
    duration: number;
    type: string;
    intensity: number;
    mainContent: string | null;
    mood: string | null;
  }>;
};

const STATUS_MAP: Record<string, string> = {
  active: "Active",
  injured: "Injured",
  retired: "Retired",
};
const GENDER_MAP: Record<string, string> = { male: "M", female: "F" };
const TYPE_MAP: Record<string, string> = {
  strength: "Strength",
  cardio: "Cardio",
  skill: "Skill",
  recovery: "Recovery",
  mixed: "Mixed",
};

function AthleteReport({ athlete }: { athlete: AthleteData }) {
  const s = athlete.strengthRecords[0];
  const p = athlete.physicalTests[0];
  const b = athlete.bodyCompositions[0];
  const recentLogs = athlete.trainingLogs.slice(0, 5);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.badge}>ATHLETE MGMT SYSTEM</Text>
            <Text style={styles.name}>{athlete.name}</Text>
            <Text style={styles.subInfo}>
              {GENDER_MAP[athlete.gender]} · {athlete.age}y · {athlete.nationality} · {athlete.sport}
              {athlete.position ? ` / ${athlete.position}` : ""}
              {athlete.team ? ` · ${athlete.team}` : ""}
              {athlete.coachName ? ` · Coach: ${athlete.coachName}` : ""}
            </Text>
          </View>
          <View>
            <Text style={styles.reportLabel}>PERFORMANCE REPORT</Text>
            <Text style={styles.reportDate}>{today}</Text>
            <Text style={[styles.reportLabel, { marginTop: 6, color: STATUS_MAP[athlete.status] === "Active" ? "#00e676" : "#ff3b3b" }]}>
              {STATUS_MAP[athlete.status] ?? athlete.status}
            </Text>
          </View>
        </View>

        {/* 基础体格 */}
        {(athlete.height || athlete.weight) && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>PHYSICAL PROFILE</Text>
            </View>
            <View style={styles.grid}>
              {athlete.height && (
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>HEIGHT</Text>
                  <Text style={styles.statValue}>{athlete.height}</Text>
                  <Text style={styles.statUnit}>cm</Text>
                </View>
              )}
              {athlete.weight && (
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>WEIGHT</Text>
                  <Text style={styles.statValue}>{athlete.weight}</Text>
                  <Text style={styles.statUnit}>kg</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 力量数据 */}
        {s && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>
                STRENGTH 1RM  ({new Date(s.recordDate).toLocaleDateString("en-US")})
              </Text>
            </View>
            <View style={styles.grid}>
              {[
                { label: "SQUAT", value: s.squat, unit: "kg" },
                { label: "DEADLIFT", value: s.deadlift, unit: "kg" },
                { label: "BENCH", value: s.benchPress, unit: "kg" },
                { label: "POWER CLEAN", value: s.powerClean, unit: "kg" },
                { label: "SNATCH", value: s.snatch, unit: "kg" },
                { label: "C&J", value: s.cleanJerk, unit: "kg" },
              ].map((item) =>
                item.value != null ? (
                  <View key={item.label} style={styles.statBox}>
                    <Text style={styles.statLabel}>{item.label}</Text>
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statUnit}>{item.unit}</Text>
                  </View>
                ) : null
              )}
            </View>
          </View>
        )}

        {/* 体能数据 */}
        {p && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>
                PHYSICAL TEST  ({new Date(p.testDate).toLocaleDateString("en-US")})
              </Text>
            </View>
            <View style={styles.grid}>
              {[
                { label: "100M SPRINT", value: p.sprint100m, unit: "s" },
                { label: "50M SPRINT", value: p.sprint50m, unit: "s" },
                { label: "3000M RUN", value: p.run3000m, unit: "s" },
                { label: "VO2MAX", value: p.vo2max, unit: "ml/kg" },
                { label: "VERT JUMP", value: p.verticalJump, unit: "cm" },
                { label: "BROAD JUMP", value: p.broadJump, unit: "cm" },
                { label: "SCORE", value: p.overallScore, unit: "pts" },
              ].map((item) =>
                item.value != null ? (
                  <View key={item.label} style={styles.statBox}>
                    <Text style={styles.statLabel}>{item.label}</Text>
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statUnit}>{item.unit}</Text>
                  </View>
                ) : null
              )}
            </View>
          </View>
        )}

        {/* 身体成分 */}
        {b && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>
                BODY COMPOSITION  ({new Date(b.testDate).toLocaleDateString("en-US")})
              </Text>
            </View>
            <View style={styles.grid}>
              {[
                { label: "BODY WEIGHT", value: b.weight, unit: "kg" },
                { label: "BODY FAT", value: b.bodyFat, unit: "%" },
                { label: "MUSCLE MASS", value: b.muscleMass, unit: "kg" },
                { label: "BMI", value: b.bmi, unit: "" },
                { label: "VISCERAL FAT", value: b.visceralFat, unit: "lvl" },
              ].map((item) =>
                item.value != null ? (
                  <View key={item.label} style={styles.statBox}>
                    <Text style={styles.statLabel}>{item.label}</Text>
                    <Text style={styles.statValue}>{item.value}</Text>
                    {item.unit ? <Text style={styles.statUnit}>{item.unit}</Text> : null}
                  </View>
                ) : null
              )}
            </View>
          </View>
        )}

        {/* 近期训练 */}
        {recentLogs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>RECENT TRAINING LOG (Last {recentLogs.length})</Text>
            </View>
            {recentLogs.map((log, i) => (
              <View key={i} style={styles.logEntry}>
                <Text style={styles.logDate}>
                  {new Date(log.date).toLocaleDateString("en-US")}  ·  {TYPE_MAP[log.type] ?? log.type}  ·  {log.duration}min  ·  Intensity {log.intensity}/10
                </Text>
                {log.mainContent && (
                  <Text style={styles.logContent}>{log.mainContent}</Text>
                )}
                {log.mood && (
                  <Text style={styles.logMeta}>Mood: {log.mood}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>ATHLETE MGMT SYSTEM  ·  CONFIDENTIAL</Text>
          <Text style={styles.footerText}>{athlete.name}  ·  Generated {today}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const athleteId = parseInt(id);

  if (isNaN(athleteId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    include: {
      strengthRecords: { orderBy: { recordDate: "desc" }, take: 1 },
      physicalTests: { orderBy: { testDate: "desc" }, take: 1 },
      bodyCompositions: { orderBy: { testDate: "desc" }, take: 1 },
      trainingLogs: { orderBy: { date: "desc" }, take: 5 },
    },
  });

  if (!athlete) {
    return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(<AthleteReport athlete={athlete} />);

  const filename = `${athlete.name.replace(/\s+/g, "_")}_Report_${new Date().toISOString().split("T")[0]}.pdf`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

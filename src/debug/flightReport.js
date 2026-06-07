import { BIRD_LAUNCH_REPORT } from "../config/birdSpriteConfig.js"

const DESYNC_WARN_DEG = 5

let enabled = BIRD_LAUNCH_REPORT
let active = null
let lastReport = null

function normDeg(deg) {
    return ((deg % 360) + 360) % 360
}

function deltaDeg(a, b) {
    let d = Math.abs(normDeg(a) - normDeg(b))
    if (d > 180) d = 360 - d
    return d
}

function fmt(n, digits = 2) {
    return n == null ? "-" : Number(n).toFixed(digits)
}

function stamp() {
    return new Date().toISOString().replace(/[:.]/g, "-")
}

function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

function buildReportText(report) {
    const lines = []

    lines.push("# Angry Birds — Launch Report")
    lines.push(`generated: ${report.generated}`)
    lines.push(`bird: ${report.birdType}`)
    lines.push(`level: ${report.levelIndex ?? "-"}`)
    lines.push(`duration: ${fmt(report.duration, 3)}s`)
    lines.push(`samples: ${report.samples.length}`)
    lines.push(`events: ${report.events.length}`)
    lines.push("")

    lines.push("## Launch")
    const L = report.launch
    lines.push(
        `pull=(${fmt(L.pullX, 1)}, ${fmt(L.pullY, 1)}) ` +
        `velocity=(${fmt(L.vx, 3)}, ${fmt(L.vy, 3)}) ` +
        `bodyAngleDeg=${fmt(L.bodyAngleDeg, 1)} ` +
        `spriteRotation=${L.spriteRotation}`
    )
    lines.push("")

    lines.push("## Events")
    if (report.events.length === 0) {
        lines.push("(none)")
    } else {
        for (const e of report.events) {
            lines.push(
                `t=${fmt(e.t, 3)}  ${e.kind}` +
                (e.detail ? `  ${e.detail}` : "")
            )
        }
    }
    lines.push("")

    lines.push("## Summary")
    const S = report.summary
    lines.push(`maxDeltaVelBody: ${fmt(S.maxDelta, 1)}° (t=${fmt(S.maxDeltaT, 3)})`)
    lines.push(`landedAt: t=${S.landedAt != null ? fmt(S.landedAt, 3) : "-"}`)
    lines.push(`impactEvalAt: t=${S.impactEvalAt != null ? fmt(S.impactEvalAt, 3) : "-"}`)
    lines.push(`postImpactSamples: ${S.postImpactSamples}`)
    lines.push(`postImpactMaxDelta: ${fmt(S.postImpactMaxDelta, 1)}°`)
    lines.push(`desyncWarnings: ${S.desyncCount}`)
    lines.push("")

    lines.push("## Samples")
    lines.push(
        "# t | phase | dead | source | velDeg | bodyDeg | delta | speed | angVel | col | rot | local | row | x | y"
    )
    for (const s of report.samples) {
        const flag = s.desync ? " !" : ""
        lines.push(
            `${fmt(s.t, 3)} | ${s.phase} | ${s.dead} | ${s.source} | ` +
            `${fmt(s.velDeg, 1)} | ${fmt(s.bodyDeg, 1)} | ${fmt(s.delta, 1)} | ` +
            `${fmt(s.speed, 2)} | ${fmt(s.angVel, 4)} | ${s.col} | ${s.rot} | ` +
            `${fmt(s.local, 1)} | ${s.row} | ${fmt(s.x, 1)} | ${fmt(s.y, 1)}${flag}`
        )
    }

    if (report.desyncLines.length > 0) {
        lines.push("")
        lines.push("## Desync warnings (|velDeg - bodyDeg| >= " + DESYNC_WARN_DEG + "°)")
        for (const d of report.desyncLines) {
            lines.push(
                `t=${fmt(d.t, 3)} phase=${d.phase} dead=${d.dead} ` +
                `delta=${fmt(d.delta, 1)}° vel=${fmt(d.velDeg, 1)}° body=${fmt(d.bodyDeg, 1)}° ` +
                `speed=${fmt(d.speed, 2)} source=${d.source}`
            )
        }
    }

    return lines.join("\n") + "\n"
}

function updateSummary(report, sample) {
    const S = report.summary
    if (sample.delta > S.maxDelta) {
        S.maxDelta = sample.delta
        S.maxDeltaT = sample.t
    }
    if (sample.desync) S.desyncCount++
    if (sample.dead && sample.t >= (report.summary.landedAt ?? 0)) {
        if (sample.delta > S.postImpactMaxDelta) S.postImpactMaxDelta = sample.delta
    }
}

export function beginLaunchReport(world, bird, pullVector, vx, vy, levelIndex) {
    if (!enabled || bird.type !== "red") return

    active = {
        birdId: bird,
        birdType: bird.type,
        levelIndex,
        startedAt: world.time,
        launch: {
            pullX: pullVector.x,
            pullY: pullVector.y,
            vx,
            vy,
            bodyAngleDeg: (bird.body.angle * 180) / Math.PI,
            spriteRotation: bird.spriteRotation,
        },
        events: [],
        samples: [],
        desyncLines: [],
        summary: {
            maxDelta: 0,
            maxDeltaT: 0,
            landedAt: null,
            impactEvalAt: null,
            postImpactSamples: 0,
            postImpactMaxDelta: 0,
            desyncCount: 0,
        },
        landed: false,
        impactEval: false,
    }

    recordLaunchEvent(world, "LAUNCH")
}

export function recordLaunchPhase(world, phaseName) {
    if (!active) return
    recordLaunchEvent(world, "PHASE", phaseName)
    if (phaseName === "IMPACT_EVAL" && !active.impactEval) {
        active.impactEval = true
        active.summary.impactEvalAt = world.time - active.startedAt
    }
}

export function recordLaunchLanded(world) {
    if (!active || active.landed) return
    active.landed = true
    active.summary.landedAt = world.time - active.startedAt
    recordLaunchEvent(world, "LANDED", "dead=true — sprite freezes when speed < STOP_SPEED")
}

export function recordLaunchCollision(world, impulse, otherLabel) {
    if (!active) return
    recordLaunchEvent(
        world,
        "COLLISION",
        `impulse=${fmt(impulse, 2)} other=${otherLabel ?? "?"}`
    )
}

function recordLaunchEvent(world, kind, detail = "") {
    if (!active) return
    active.events.push({
        t: world.time - active.startedAt,
        kind,
        detail,
    })
}

export function recordLaunchSample(bird, facing, frame, row, phase, world) {
    if (!active || active.birdId !== bird || !bird.launched) return

    const t = world.time - active.startedAt
    const velDeg = facing.velDeg ?? null
    const bodyDeg = facing.bodyDeg ?? null
    const delta = velDeg != null && bodyDeg != null ? deltaDeg(velDeg, bodyDeg) : 0
    const speed = facing.speed ?? 0
    const desync = !bird.dead && speed >= 0.4 && delta >= DESYNC_WARN_DEG

    const sample = {
        t,
        phase: phase ?? "?",
        dead: bird.dead,
        source: facing.source,
        velDeg,
        bodyDeg,
        delta,
        speed,
        angVel: bird.body.angularVelocity,
        col: frame.col,
        rot: frame.rotation,
        local: frame.local,
        row,
        x: bird.body.position.x,
        y: bird.body.position.y,
        desync,
    }

    active.samples.push(sample)
    updateSummary(active, sample)

    if (active.landed) active.summary.postImpactSamples++

    if (desync) {
        active.desyncLines.push({
            t,
            phase: sample.phase,
            dead: sample.dead,
            delta,
            velDeg,
            bodyDeg,
            speed,
            source: facing.source,
        })
    }
}

export function finalizeLaunchReport(world, reason = "retired") {
    if (!active) return null

    recordLaunchEvent(world, "END", reason)

    const report = {
        generated: new Date().toISOString(),
        birdType: active.birdType,
        levelIndex: active.levelIndex,
        duration: world.time - active.startedAt,
        launch: active.launch,
        events: active.events,
        samples: active.samples,
        desyncLines: active.desyncLines,
        summary: { ...active.summary },
    }

    const text = buildReportText(report)
    const filename = `launch-report-${stamp()}.txt`
    downloadText(filename, text)

    lastReport = { filename, text, report }
    active = null

    console.log(`[flight report] downloaded ${filename} (${report.samples.length} samples)`)
    return lastReport
}

export function setLaunchReportEnabled(on) {
    enabled = !!on
}

export function isLaunchReportEnabled() {
    return enabled
}

export function getLastLaunchReport() {
    return lastReport
}

if (typeof window !== "undefined") {
    window.flightReport = {
        enable: () => setLaunchReportEnabled(true),
        disable: () => setLaunchReportEnabled(false),
        status: () => ({ enabled, recording: !!active, lastFile: lastReport?.filename ?? null }),
        redownload: () => {
            if (!lastReport) {
                console.warn("[flight report] no report yet — launch a red bird first")
                return
            }
            downloadText(lastReport.filename, lastReport.text)
        },
        help: () => console.log(
            "flightReport — auto-downloads launch-report-<timestamp>.txt after each shot\n" +
            "  enable() | disable() | status() | redownload()\n" +
            "Report covers launch → impact → IMPACT_EVAL (post-impact rotation)"
        ),
    }
}

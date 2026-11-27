"use client";

import { use, useEffect, useState } from "react";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { Page } from "../DashboardShell";
import { Button, IconButton, PageHeader } from "../ui";

/** The consultation room. The call itself connects through the video provider (see api.bookings.joinConsultation). */
export default function ConsultationScreen({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [room, setRoom] = useState<{ studio: string; staff: string; topic: string } | null>(null);
  const [muted, setMuted] = useState(false);
  const [camera, setCamera] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.bookings.joinConsultation(code).then((next) => { if (!cancelled) setRoom(next); });
    return () => { cancelled = true; };
  }, [code]);

  return (
    <Page>
      <PageHeader title="Consultation" back={`/dashboard/bookings/${code}`} />
      <div className="d-call">
        <div className="d-call-stage" aria-live="polite">
          <span className="d-call-avatar">{(room?.staff ?? "A")[0]}</span>
          <h2>{room?.staff ?? "Connecting…"}</h2>
          <p>{room ? `${room.studio} · ${room.topic} consult` : "Joining the room"}</p>
          <small>Video connects once a call provider is set up for this studio.</small>
        </div>
        <div className="d-call-controls">
          <IconButton icon={muted ? MicOff : Mic} label={muted ? "Unmute" : "Mute"} selected={muted} onClick={() => setMuted((value) => !value)} />
          <IconButton icon={camera ? Video : VideoOff} label={camera ? "Turn camera off" : "Turn camera on"} selected={!camera} onClick={() => setCamera((value) => !value)} />
          <Button variant="dark" icon={PhoneOff} href={`/dashboard/bookings/${code}`}>End call</Button>
        </div>
      </div>
    </Page>
  );
}

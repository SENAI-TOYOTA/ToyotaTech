"use client";

import { Clock, ExternalLink, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Badge, buttonStyles } from "@/components/ui";
import { cn } from "@/lib/cn";
import { getVideoUrl, NEWS_VIDEOS } from "@/lib/mocks/engagement";

export default function NewsView() {
  const [selected, setSelected] = useState(0);
  const video = NEWS_VIDEOS[selected];
  const url = getVideoUrl(video);

  return (
    <div>
      <PageHeader
        eyebrow="Notícias"
        title="Notícias e vídeos"
        description="Veja como seu Toyota é fabricado, inspecionado e entregue."
      />

      <div className="grid items-start gap-5 wide:grid-cols-[1fr_320px]">
        <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          {video.youtubeId ? (
            <iframe
              className="aspect-video w-full"
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Assistir: ${video.title}`}
              className="group relative block aspect-video bg-ink"
            >
              <Image src={video.image} alt="" fill sizes="(min-width: 960px) 60vw, 100vw" className="object-cover" />
              <span className="absolute inset-0 bg-ink/35 transition group-hover:bg-ink/25" />
              <span className="absolute top-1/2 left-1/2 flex size-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary pl-1 text-white transition group-hover:scale-105">
                <Play aria-hidden size={32} fill="currentColor" />
              </span>
            </a>
          )}
          <div className="p-5">
            <Badge label={video.category} tone="primary" />
            <h2 className="mt-2 text-2xl font-bold text-fg">{video.title}</h2>
            <p className="mt-1 text-fg-secondary">{video.description}</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-fg-muted">
              <Clock aria-hidden size={16} /> {video.duration}
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "secondary", size: "md", className: "mt-4" })}
            >
              <ExternalLink aria-hidden size={16} />
              Assistir no YouTube
            </a>
          </div>
        </article>

        <section aria-labelledby="todos-videos">
          <h2 id="todos-videos" className="mb-3 text-xl font-bold text-fg">
            Todos os vídeos
          </h2>
          <ul className="flex flex-col gap-2">
            {NEWS_VIDEOS.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(index)}
                  aria-current={index === selected}
                  className={cn(
                    "flex w-full cursor-pointer gap-3 rounded-xl border p-2 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-primary/30",
                    index === selected ? "border-primary bg-primary-soft" : "border-border bg-surface hover:bg-surface-muted",
                  )}
                >
                  <span className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-ink">
                    <Image src={item.image} alt="" fill sizes="112px" className="object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex size-7 items-center justify-center rounded-full bg-ink/70 text-white">
                        <Play aria-hidden size={14} fill="currentColor" />
                      </span>
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold tracking-wide text-primary uppercase">{item.category}</span>
                    <span className="line-clamp-2 block font-semibold text-fg">{item.title}</span>
                    <span className="block text-sm text-fg-muted">{item.duration}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

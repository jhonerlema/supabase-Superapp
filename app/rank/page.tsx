"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { getTimeAgo } from "../utils/time";
import { type Post } from "../mocks/posts";

import { supabase } from "../utils/supabase/client";
//import { SEGMENT_EXPLORER_SIMULATED_ERROR_MESSAGE } from "next/dist/next-devtools/userspace/app/segment-explorer-node";

// ── Constantes ───────────────────────────────────────────────────────────────
const USER_MAP: Record<string, { username: string; avatar: string }> = {
  "11111111-1111-1111-1111-111111111111": { username: "erasmo",  avatar: "https://i.pravatar.cc/150?img=1"  },
  "22222222-2222-2222-2222-222222222222": { username: "maria",   avatar: "https://i.pravatar.cc/150?img=5"  },
  "33333333-3333-3333-3333-333333333333": { username: "juan",    avatar: "https://i.pravatar.cc/150?img=8"  },
  "44444444-4444-4444-4444-444444444444": { username: "ana",     avatar: "https://i.pravatar.cc/150?img=9"  },
  "55555555-5555-5555-5555-555555555555": { username: "carlos",  avatar: "https://i.pravatar.cc/150?img=2"  },
  "66666666-6666-6666-6666-666666666666": { username: "sofia",   avatar: "https://i.pravatar.cc/150?img=3"  },
  "77777777-7777-7777-7777-777777777777": { username: "luis",    avatar: "https://i.pravatar.cc/150?img=12" },
  "88888888-8888-8888-8888-888888888888": { username: "daniela", avatar: "https://i.pravatar.cc/150?img=10" },
  "99999999-9999-9999-9999-999999999999": { username: "pedro",   avatar: "https://i.pravatar.cc/150?img=11" },
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa": { username: "lucia",   avatar: "https://i.pravatar.cc/150?img=6"  },
};

const DEFAULT_USER = { username: "usuario", avatar: "https://i.pravatar.cc/150?img=1" };

// ── Componentes ──────────────────────────────────────────────────────────────

function HeartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6 text-red-500"
    >
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}
function Modal({ post, onClose }: { post: Post; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-card-bg rounded-xl overflow-hidden max-w-lg w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Cerrar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header con usuario */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary">
            <Image
              src={post.user.avatar || ""}
              alt={post.user.username || "default_user"}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {post.user.username || "default_user"}
            </span>
            <span className="text-xs text-foreground/50">
              {getTimeAgo(post.created_at)}
            </span>
          </div>
        </div>

        {/* Imagen */}
        <div className="relative w-full aspect-square">
          <Image
            src={post.image_url}
            alt={`Post de ${post.user.username || "default_user" }`}
            fill
            sizes="(max-width: 512px) 100vw, 512px"
            className="object-cover"
          />
        </div>

        {/* Likes y caption */}
        <div className="p-4">
          <div className="flex items-center gap-2">
            <HeartIcon />
            <span className="text-lg font-bold text-foreground">
              {post.likes.toLocaleString()} likes
            </span>
          </div>
          <p className="mt-2 text-foreground">
            <span className="font-semibold">{post.user.username || "default_user"}</span>{" "}
            <span className="text-foreground/80">{post.caption}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
// ── Page ─────────────────────────────────────────────────────────────────────

export default function RankPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
      const fetchPosts = async () => {
        const { data, error } = await supabase
          .from("post_new")
          .select("id, image_url, caption, likes, user_id, created_at")
          .gt("likes", 5) // solo posts con likes > 0
          .order("likes", { ascending: false });

        if (error) {
          console.error("Error al obtener los posts:", error);
          return;
        }

        // Mapear los datos de Supabase al formato de Post
        // ← FALTABA EL MAPEO — no puedes hacer setPosts(data) directo
        const mapped: Post[] = data.map((row) => ({
          id: row.id,
          image_url:
            row.image_url ?? "https://picsum.photos/seed/default/600/600",
          caption: row.caption ?? "",
          likes: Number(row.likes) ?? 0,
          isLiked: false,
          created_at: row.created_at,
          user: USER_MAP[row.user_id] ?? DEFAULT_USER,
        }));

        setPosts(mapped);
      };


      fetchPosts();
    }, []);


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card-bg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RankTop🔝
          </h1>
        </div>
      </header>

      {/* Grid de posts */}
      <main className="max-w-2xl mx-auto p-2">
        <div className="grid grid-cols-3 gap-1">
          {[...posts]
            .sort((a, b) => b.likes - a.likes)
            .map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="relative aspect-square overflow-hidden group"
              >
                <Image
                  src={post.image_url}
                  alt={`Post con ${post.likes} likes`}
                  fill
                  sizes="(max'width: 672) 33vw, 224px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {/* Overlay con likes al hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <HeartIcon />
                  <span className="text-white font-semibold">
                    {new Intl.NumberFormat("es-ES").format(post.likes)}
                  </span>
                </div>
              </button>
            ))}
        </div>
      </main>

      {/* Modal */}
      {selectedPost && (
        <Modal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}

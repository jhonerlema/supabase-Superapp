"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { getTimeAgo } from "./utils/time";
import { type Post } from "./mocks/posts";
import { supabase } from "./utils/supabase/client";

// ── Constantes de módulo (fuera del componente) ─────────────────────────────
const USER_MAP: Record<string, { username: string; avatar: string }> = {
  "11111111-1111-1111-1111-111111111111": {
    username: "erasmo",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  "22222222-2222-2222-2222-222222222222": {
    username: "maria",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  "33333333-3333-3333-3333-333333333333": {
    username: "juan",
    avatar: "https://i.pravatar.cc/150?img=8",
  },
  "44444444-4444-4444-4444-444444444444": {
    username: "ana",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  "55555555-5555-5555-5555-555555555555": {
    username: "carlos",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  "66666666-6666-6666-6666-666666666666": {
    username: "sofia",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  "77777777-7777-7777-7777-777777777777": {
    username: "luis",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  "88888888-8888-8888-8888-888888888888": {
    username: "daniela",
    avatar: "https://i.pravatar.cc/150?img=10",
  },
  "99999999-9999-9999-9999-999999999999": {
    username: "pedro",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa": {
    username: "lucia",
    avatar: "https://i.pravatar.cc/150?img=6",
  },
};

const DEFAULT_USER = {
  username: "usuario",
  avatar: "https://i.pravatar.cc/150?img=1",
};

// ── Componentes ─────────────────────────────────────────────────────────────
function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7 text-red-500"
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-7 h-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function PostCard({
  post,
  onLike,
}: {
  post: Post;
  onLike: (id: string) => void;
}) {
  return (
    <article className="bg-card-bg border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary">
          <Image
            src={post.user.avatar}
            alt={post.user.username}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">
            {post.user.username}
          </span>
          <span className="text-xs text-foreground/50">
            {getTimeAgo(new Date(post.created_at))}
          </span>
        </div>
      </div>

      <div className="relative w-full aspect-square">
        <Image
          src={post.image_url}
          alt={`Post de ${post.user.username}`}
          fill
          sizes="(max-width: 512px) 100vw, 512px"
          loading="eager"
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onLike(post.id as string)}
            className="hover:scale-110 transition-transform active:scale-95"
            aria-label={post.isLiked ? "Quitar like" : "Dar like"}
          >
            <HeartIcon filled={post.isLiked} />
          </button>
          <span className="font-semibold text-foreground">
            {new Intl.NumberFormat("es-ES").format(post.likes)} likes
          </span>
        </div>
        <p className="mt-2 text-foreground">
          <span className="font-semibold">{post.user.username}</span>{" "}
          <span className="text-foreground/80">{post.caption}</span>
        </p>
      </div>
    </article>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("post_new")
        .select("id, user_id, image_url, caption, likes, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener los posts:", error);
        return;
      } else {
        console.log("Posts ordenados por fecha:", data);
      };

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
      <header className="sticky top-0 z-50 bg-card-bg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SuperApp💪🏼
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

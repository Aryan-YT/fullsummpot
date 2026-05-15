/**
 * Mock API — simulates a real backend using localStorage.
 * Swap this out for real API calls when your backend is ready.
 */

import type { Community, Link, User, Points, Notification } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────
function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

function getDB<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`fsp_${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setDB<T>(key: string, value: T) {
  localStorage.setItem(`fsp_${key}`, JSON.stringify(value));
}

// ── Seed default communities ──────────────────────────────────────────────
function seedCommunities() {
  const existing = getDB<Community[]>('communities', []);
  if (existing.length) return;

  const defaults: Community[] = [
    { id: 'c1', name: 'Gaming Legends', description: 'Share your best gaming clips and grow together!', niche: 'Gaming', memberCount: 142, createdAt: new Date().toISOString(), isMember: false },
    { id: 'c2', name: 'Tech Creators Hub', description: 'For developers and tech enthusiasts making YouTube content.', niche: 'Tech', memberCount: 98, createdAt: new Date().toISOString(), isMember: false },
    { id: 'c3', name: 'Edu Universe', description: 'Educational creators helping each other grow.', niche: 'Education', memberCount: 213, createdAt: new Date().toISOString(), isMember: false },
    { id: 'c4', name: 'Comedy Central Creators', description: 'Comedy and entertainment channel support group.', niche: 'Comedy', memberCount: 76, createdAt: new Date().toISOString(), isMember: false },
    { id: 'c5', name: 'Music Makers', description: 'Musicians sharing their work and supporting each other.', niche: 'Music', memberCount: 167, createdAt: new Date().toISOString(), isMember: false },
    { id: 'c6', name: 'Vlog Squad', description: 'Daily vloggers uniting for growth.', niche: 'Vlogging', memberCount: 55, createdAt: new Date().toISOString(), isMember: false },
  ];
  setDB('communities', defaults);
  // seed sample links for c1
  const links: Link[] = [
    { id: 'l1', communityId: 'c1', userId: 'demo', username: 'TechNinja', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'My First Gaming Video!', thumbnailUrl: '', clickCount: 24, createdAt: new Date().toISOString(), isClickedByMe: false },
    { id: 'l2', communityId: 'c1', userId: 'demo', username: 'GamingKing', youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0', title: 'Epic Boss Fight Compilation', thumbnailUrl: '', clickCount: 41, createdAt: new Date().toISOString(), isClickedByMe: false },
  ];
  setDB('links_c1', links);
}

seedCommunities();

// ── Auth ──────────────────────────────────────────────────────────────────
export const mockAuthApi = {
  async login(data: { email: string; password: string }) {
    await delay(600);
    const users = getDB<User[]>('users', []);
    const stored = users.find((u) => u.email === data.email);
    if (!stored) throw { response: { data: { message: 'No account found with that email.' } } };
    const pws = getDB<Record<string, string>>('passwords', {});
    if (pws[data.email] !== data.password) throw { response: { data: { message: 'Incorrect password.' } } };
    const token = `mock_token_${stored.id}`;
    return { data: { user: stored, token } };
  },

  async register(data: { username: string; email: string; password: string; niche: string }) {
    await delay(700);
    const users = getDB<User[]>('users', []);
    if (users.find((u) => u.email === data.email)) {
      throw { response: { data: { message: 'An account with this email already exists.' } } };
    }
    const newUser: User = {
      id: `u_${Date.now()}`,
      username: data.username,
      email: data.email,
      niche: data.niche,
      createdAt: new Date().toISOString(),
    };
    setDB('users', [...users, newUser]);
    const pws = getDB<Record<string, string>>('passwords', {});
    setDB('passwords', { ...pws, [data.email]: data.password });
    return { data: { user: newUser, token: `mock_token_${newUser.id}` } };
  },

  async me(userId: string) {
    await delay(200);
    const users = getDB<User[]>('users', []);
    const u = users.find((x) => x.id === userId);
    if (!u) throw { response: { status: 401 } };
    return { data: u };
  },
};

// ── Communities ───────────────────────────────────────────────────────────
export const mockCommunitiesApi = {
  async list(userId: string) {
    await delay(400);
    const all = getDB<Community[]>('communities', []);
    const memberships = getDB<Record<string, string[]>>('memberships', {});
    return {
      data: all.map((c) => ({
        ...c,
        isMember: (memberships[c.id] ?? []).includes(userId),
        memberCount: (memberships[c.id] ?? []).length + c.memberCount,
      })),
    };
  },

  async get(id: string, userId: string) {
    await delay(300);
    const all = getDB<Community[]>('communities', []);
    const c = all.find((x) => x.id === id);
    if (!c) throw { response: { status: 404 } };
    const memberships = getDB<Record<string, string[]>>('memberships', {});
    return {
      data: {
        ...c,
        isMember: (memberships[id] ?? []).includes(userId),
        memberCount: (memberships[id] ?? []).length + c.memberCount,
      },
    };
  },

  async create(data: { name: string; description: string; niche: string }, userId: string) {
    await delay(500);
    const all = getDB<Community[]>('communities', []);
    const newC: Community = {
      id: `c_${Date.now()}`,
      name: data.name,
      description: data.description,
      niche: data.niche,
      memberCount: 1,
      createdAt: new Date().toISOString(),
      isMember: true,
    };
    setDB('communities', [...all, newC]);
    // Auto-join creator
    const memberships = getDB<Record<string, string[]>>('memberships', {});
    memberships[newC.id] = [userId];
    setDB('memberships', memberships);
    return { data: newC };
  },

  async join(communityId: string, userId: string) {
    await delay(300);
    const memberships = getDB<Record<string, string[]>>('memberships', {});
    const members = memberships[communityId] ?? [];
    if (!members.includes(userId)) {
      memberships[communityId] = [...members, userId];
      setDB('memberships', memberships);
    }
    return { data: { success: true } };
  },

  async leave(communityId: string, userId: string) {
    await delay(300);
    const memberships = getDB<Record<string, string[]>>('memberships', {});
    memberships[communityId] = (memberships[communityId] ?? []).filter((id) => id !== userId);
    setDB('memberships', memberships);
    return { data: { success: true } };
  },
};

// ── Links ─────────────────────────────────────────────────────────────────
function extractVideoId(url: string) {
  return url.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1] ?? null;
}

export const mockLinksApi = {
  async list(communityId: string, userId: string) {
    await delay(400);
    const links = getDB<Link[]>(`links_${communityId}`, []);
    return {
      data: links.map((l) => ({
        ...l,
        thumbnailUrl: l.thumbnailUrl || (extractVideoId(l.youtubeUrl) ? `https://img.youtube.com/vi/${extractVideoId(l.youtubeUrl)}/mqdefault.jpg` : ''),
        isClickedByMe: getDB<string[]>(`clicks_${userId}`, []).includes(l.id),
      })),
    };
  },

  async submit(communityId: string, data: { youtubeUrl: string; title: string }, user: User) {
    await delay(500);
    const links = getDB<Link[]>(`links_${communityId}`, []);
    const videoId = extractVideoId(data.youtubeUrl);
    const newLink: Link = {
      id: `l_${Date.now()}`,
      communityId,
      userId: user.id,
      username: user.username,
      youtubeUrl: data.youtubeUrl,
      title: data.title,
      thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '',
      clickCount: 0,
      createdAt: new Date().toISOString(),
      isClickedByMe: false,
    };
    setDB(`links_${communityId}`, [newLink, ...links]);
    return { data: newLink };
  },

  async click(linkId: string, userId: string) {
    await delay(200);
    const clicks = getDB<string[]>(`clicks_${userId}`, []);
    if (!clicks.includes(linkId)) {
      setDB(`clicks_${userId}`, [...clicks, linkId]);
      // increment click count across all community links
      const allKeys = Object.keys(localStorage).filter((k) => k.startsWith('fsp_links_'));
      for (const key of allKeys) {
        const links = JSON.parse(localStorage.getItem(key)!) as Link[];
        const idx = links.findIndex((l) => l.id === linkId);
        if (idx !== -1) {
          links[idx].clickCount++;
          localStorage.setItem(key, JSON.stringify(links));
          break;
        }
      }
      // award points
      const pts = getDB<Points>(`points_${userId}`, { availablePoints: 100, pointsEarnedToday: 0, viewsGivenToday: 0 });
      setDB(`points_${userId}`, {
        ...pts,
        pointsEarnedToday: pts.pointsEarnedToday + 5,
        viewsGivenToday: pts.viewsGivenToday + 1,
      });
    }
    return { data: { success: true } };
  },

  async myLinks(userId: string) {
    await delay(400);
    const allKeys = Object.keys(localStorage).filter((k) => k.startsWith('fsp_links_'));
    const mine: Link[] = [];
    for (const key of allKeys) {
      const links = JSON.parse(localStorage.getItem(key)!) as Link[];
      mine.push(...links.filter((l) => l.userId === userId));
    }
    return { data: mine.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
  },
};

// ── Points ────────────────────────────────────────────────────────────────
export const mockPointsApi = {
  async myPoints(userId: string) {
    await delay(200);
    const pts = getDB<Points>(`points_${userId}`, { availablePoints: 100, pointsEarnedToday: 0, viewsGivenToday: 0 });
    return { data: pts };
  },
};

// ── Leaderboard ───────────────────────────────────────────────────────────
export const mockLeaderboardApi = {
  async list() {
    await delay(500);
    const users = getDB<User[]>('users', []);
    const leaderboard = users.map((u, i) => {
      // simulate some data for mock users
      const points = 5000 - i * 380 + (u.username === 'TechNinja' ? 1000 : 0);
      return {
        rank: 0, // will calculate below
        username: u.username,
        niche: u.niche,
        points: points,
        linksSubmitted: 40 - i * 3,
        clicksReceived: 320 - i * 28,
      };
    });

    // Add some static top creators if users is empty
    if (leaderboard.length < 5) {
      const defaults = [
        { rank: 1, username: 'TechNinja', niche: 'Tech', points: 5400, linksSubmitted: 45, clicksReceived: 380 },
        { rank: 2, username: 'GamingKing', niche: 'Gaming', points: 4200, linksSubmitted: 38, clicksReceived: 290 },
        { rank: 3, username: 'MusicMaestro', niche: 'Music', points: 3900, linksSubmitted: 32, clicksReceived: 245 },
        { rank: 4, username: 'EduPro', niche: 'Education', points: 3100, linksSubmitted: 28, clicksReceived: 190 },
        { rank: 5, username: 'ComedyGod', niche: 'Comedy', points: 2800, linksSubmitted: 22, clicksReceived: 155 },
      ];
      leaderboard.push(...defaults);
    }

    return {
      data: leaderboard
        .sort((a, b) => b.points - a.points)
        .map((item, idx) => ({ ...item, rank: idx + 1 }))
        .slice(0, 10),
    };
  },
};

// ── Notifications ─────────────────────────────────────────────────────────
export const mockNotificationsApi = {
  async list(userId: string) {
    await delay(300);
    const notifs = getDB<Notification[]>(`notifs_${userId}`, [
      { id: 'n1', message: '🎉 Welcome to Full Sumppot! Join a community to get started.', type: 'info', isRead: false, createdAt: new Date().toISOString() },
    ]);
    return { data: notifs };
  },

  async markRead(notifId: string, userId: string) {
    await delay(200);
    const notifs = getDB<Notification[]>(`notifs_${userId}`, []);
    setDB(`notifs_${userId}`, notifs.map((n) => n.id === notifId ? { ...n, isRead: true } : n));
    return { data: { success: true } };
  },

  async markAllRead(userId: string) {
    await delay(200);
    const notifs = getDB<Notification[]>(`notifs_${userId}`, []);
    setDB(`notifs_${userId}`, notifs.map((n) => ({ ...n, isRead: true })));
    return { data: { success: true } };
  },
};

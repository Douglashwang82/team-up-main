'use client';

import { useState, useEffect } from 'react';
import { apis } from '../api';
import { JoinRequestOut, SearchTeamUpsRequest, TeamUpDetailOut, TeamUpOut } from '@team-up-main/api-client';

export function useTeamUps(params?: SearchTeamUpsRequest) {
  const [teamups, setTeamUps] = useState<TeamUpOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!params) {
      setTeamUps([]);
      setIsLoading(false);
      return;
    }

    const fetchTeamUps = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response: TeamUpOut[] = await apis.teamups.searchTeamUps({
          keyword: params?.keyword || '',
          limit: params?.limit,
          offset: params?.offset,
        });

        setTeamUps(response);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamUps();
  }, [params?.keyword, params?.limit, params?.offset]);

  return { teamups, isLoading, error };
}

export function useMyTeamUps() {
  const [teamups, setTeamUps] = useState<TeamUpOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMyTeamUps = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teamups/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch my teamups: ${response.statusText}`);
        }

        const data = await response.json();
        setTeamUps(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTeamUps();
  }, []);

  return { teamups, isLoading, error };
}

export function useTeamUp(teamupId: string) {
  const [teamup, setTeamUp] = useState<TeamUpDetailOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeamUp = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const teamup: TeamUpDetailOut = await apis.teamups.getTeamupById({ teamupId });
        setTeamUp(teamup);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    if (teamupId) {
      fetchTeamUp();
    }
  }, [teamupId]);

  const updateTeamUp = async (updates: Partial<TeamUpOut>) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teamups/${teamupId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update teamup: ${response.statusText}`);
      }

      const data = await response.json();
      setTeamUp(data);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deleteTeamUp = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teamups/${teamupId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete teamup: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  return { teamup, isLoading, error, updateTeamUp, deleteTeamUp };
}

export async function createTeamUp(data: {
  title: string;
  description?: string;
  max_participants: number;
  visibility?: 'public' | 'private';
  durantion_type?: 'temporary' | 'recurring';
}) {
  try {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teamups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create teamup: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    throw err;
  }
}

export function useJoinRequests(teamupId: string) {
  const [requests, setRequests] = useState<JoinRequestOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/teamups/${teamupId}/join-requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch join requests: ${response.statusText}`);
        }

        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    if (teamupId) {
      fetchRequests();
    }
  }, [teamupId]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/teamups/${teamupId}/join-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch join requests: ${response.statusText}`);
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return { requests, isLoading, error, refetch };
}

export async function createJoinRequest(teamupId: string) {
  try {
    await apis.teamups.joinTeamup({ teamupId });
    return;
  } catch (err) {
    throw err;
  }
}

export async function reviewJoinRequest(
  teamupId: string,
  requestId: string,
  action: 'approve' | 'reject'
) {
  try {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/teamups/${teamupId}/join-requests/${requestId}/${action}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to ${action} join request: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    throw err;
  }
}
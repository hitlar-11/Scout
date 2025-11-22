// API client using React Query with Supabase
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  eventsApi,
  galleryApi,
  storiesApi,
  contactApi,
  userApi,
  adminApi,
  competitionApi,
  competitionQuestionsApi,
  competitionResultsApi,
  leaderboardApi,
  eventRegistrationsApi,
  competitionAnswersApi,
} from './api';
import { toast } from 'sonner';

// Helper to normalize mutation status across react-query versions
function mutationPending(mutation: any) {
  return (mutation as any).isPending ?? mutation.isLoading ?? false;
}

// React Query hooks that mimic tRPC interface
export const trpc = {
  // Events
  events: {
    list: {
      useQuery: () => {
        const query = useQuery({
          queryKey: ['events'],
          queryFn: () => eventsApi.list(),
        });
        return { data: query.data || [], isLoading: query.isLoading, refetch: query.refetch };
      },
    },
    create: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (data: any) => eventsApi.create(data),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast.success('تم إنشاء الفعالية بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل إنشاء الفعالية');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
    update: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: ({ id, ...data }: any) => eventsApi.update(id, data),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast.success('تم تحديث الفعالية بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل تحديث الفعالية');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
    delete: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (id: string) => eventsApi.delete(id),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast.success('تم حذف الفعالية بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل حذف الفعالية');
            opts?.onError?.(error);
          },
        });
        return { mutate: (id: any) => mutation.mutate(id), isPending: mutationPending(mutation) };
      },
    },
    // Update status (e.g., upcoming, ongoing, completed)
    updateStatus: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: async ({ id, status }: { id: string; status: 'upcoming' | 'ongoing' | 'completed' }) => {
            await eventsApi.updateStatus(id, status);
            if (status === 'completed') {
              await eventRegistrationsApi.awardPoints(id);
            }
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
            toast.success('تم تحديث حالة الفعالية واحتساب النقاط بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل تحديث حالة الفعالية');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
  },
  // Gallery
  gallery: {
    list: {
      useQuery: () => {
        const query = useQuery({
          queryKey: ['gallery'],
          queryFn: () => galleryApi.list(),
        });
        return { data: query.data || [], isLoading: query.isLoading, refetch: query.refetch };
      },
    },
    create: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (data: any) => galleryApi.create(data),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
            toast.success('تم إضافة الصورة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل إضافة الصورة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
    update: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: ({ id, ...data }: any) => galleryApi.update(id, data),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
            toast.success('تم تحديث الصورة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل تحديث الصورة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
    delete: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (id: string) => galleryApi.delete(id),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
            toast.success('تم حذف الصورة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل حذف الصورة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (id: any) => mutation.mutate(id), isPending: mutationPending(mutation) };
      },
    },
  },
  // Stories
  stories: {
    list: {
      useQuery: (userId?: string) => {
        const query = useQuery({
          queryKey: ['stories', userId],
          queryFn: () => storiesApi.list(userId),
        });
        return { data: query.data || [], isLoading: query.isLoading, refetch: query.refetch };
      },
    },
    create: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (data: any) => storiesApi.create(data),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stories'] });
            toast.success('تم إضافة القصة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل إضافة القصة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
    update: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: ({ id, ...data }: any) => storiesApi.update(id, data),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stories'] });
            toast.success('تم تحديث القصة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل تحديث القصة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
    delete: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (id: string) => storiesApi.delete(id),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stories'] });
            toast.success('تم حذف القصة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل حذف القصة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (id: any) => mutation.mutate(id), isPending: mutationPending(mutation) };
      },
    },
  },
  // Contact
  contact: {
    submit: {
      useMutation: (opts?: any) => {
        const mutation = useMutation({
          mutationFn: (data: any) => contactApi.submit(data),
          onSuccess: () => {
            toast.success('تم إرسال الرسالة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل إرسال الرسالة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
    markAsRead: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (id: string) => contactApi.markAsRead(id),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            opts?.onError?.(error);
          },
        });
        return { mutate: (id: any) => mutation.mutate(id), isPending: mutationPending(mutation) };
      },
    },
    delete: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (id: string) => contactApi.delete(id),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
            toast.success('تم حذف الرسالة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل حذف الرسالة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (id: any) => mutation.mutate(id), isPending: mutationPending(mutation) };
      },
    },
  },
  // User
  user: {
    getProfile: {
      useQuery: (userId?: string, opts?: any) => {
        const query = useQuery({
          queryKey: ['user', userId],
          queryFn: () => (userId ? userApi.getProfile(userId) : Promise.resolve(undefined)),
          enabled: !!userId && (opts?.enabled !== false),
        });
        return { data: query.data, isLoading: query.isLoading };
      },
    },
    updateProfile: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: ({ userId, ...data }: any) => userApi.updateProfile(userId, data),
          onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
            toast.success('تم تحديث الملف الشخصي بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل تحديث الملف الشخصي');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
  },
  // Admin
  admin: {
    getAllUsers: {
      useQuery: () => {
        const query = useQuery({
          queryKey: ['admin', 'users'],
          queryFn: () => adminApi.getAllUsers(),
        });
        return { data: query.data || [], isLoading: query.isLoading };
      },
    },
    getMessages: {
      useQuery: () => {
        const query = useQuery({
          queryKey: ['contactMessages'],
          queryFn: () => adminApi.getMessages(),
        });
        return { data: query.data || [], isLoading: query.isLoading, refetch: query.refetch };
      },
    },
  },
  // Competition
  competition: {
    getAll: {
      useQuery: () => {
        const query = useQuery({
          queryKey: ['competitions'],
          queryFn: () => competitionApi.getAll(),
        });
        return { data: query.data || [], isLoading: query.isLoading, refetch: query.refetch };
      },
    },
    getById: {
      useQuery: ({ id }: { id: string }, opts?: any) => {
        const query = useQuery({
          queryKey: ['competition', id],
          queryFn: () => competitionApi.getById(id),
          enabled: !!id && (opts?.enabled !== false),
        });
        return { data: query.data, isLoading: query.isLoading };
      },
    },
    create: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (data: any) => competitionApi.create(data),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['competitions'] });
            toast.success('تم إنشاء المسابقة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('خطأ في إنشاء المسابقة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
    delete: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (id: string) => competitionApi.delete(id),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['competitions'] });
            toast.success('تم حذف المسابقة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('خطأ في حذف المسابقة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (id: any) => mutation.mutate(id), isPending: mutationPending(mutation) };
      },
    },
    // Update status (draft, active, finished)
    updateStatus: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: ({ id, status }: { id: string; status: 'draft' | 'active' | 'finished' }) => competitionApi.updateStatus(id, status),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['competitions'] });
            toast.success('تم تحديث حالة المسابقة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل تحديث حالة المسابقة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
    hasUserEntered: {
      useQuery: (competitionId: string, userId: string) => {
        const query = useQuery({
          queryKey: ['hasUserEntered', competitionId, userId],
          queryFn: () => competitionApi.hasUserEntered(competitionId, userId),
          enabled: !!competitionId && !!userId,
        });
        return { data: query.data || false, isLoading: query.isLoading };
      },
    },
    getRandomQuestions: {
      useQuery: ({ competitionId, count }: { competitionId: string; count: number }, opts?: any) => {
        const query = useQuery({
          queryKey: ['competitionRandomQuestions', competitionId],
          queryFn: () => competitionQuestionsApi.getRandom(competitionId, count),
          enabled: !!competitionId && (opts?.enabled !== false),
        });
        return { data: query.data || [], isLoading: query.isLoading };
      },
    },
    saveAnswer: {
      useMutation: (opts?: any) => {
        const mutation = useMutation({
          mutationFn: (data: any) => competitionAnswersApi.create(data),
          onError: (error: any) => {
            console.error('Failed to save answer:', error);
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), mutateAsync: (data: any) => mutation.mutateAsync(data), isPending: mutationPending(mutation) };
      },
    },
    getAnswers: {
      useQuery: (userId: string, competitionId: string) => {
        const query = useQuery({
          queryKey: ['competitionAnswers', userId, competitionId],
          queryFn: () => competitionAnswersApi.getByUserAndCompetition(userId, competitionId),
          enabled: !!userId && !!competitionId,
        });
        return { data: query.data || [], isLoading: query.isLoading };
      },
    },
    saveResult: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (data: any) => competitionResultsApi.create(data),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['competitionResults'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            console.error('Failed to save result:', error);
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), mutateAsync: (data: any) => mutation.mutateAsync(data), isPending: mutationPending(mutation) };
      },
    },
  },
  // Competition Questions
  competitionQuestions: {
    list: {
      useQuery: (competitionId: string) => {
        const query = useQuery({
          queryKey: ['competitionQuestions', competitionId],
          queryFn: () => competitionQuestionsApi.getByCompetition(competitionId),
          enabled: !!competitionId,
        });
        return { data: query.data || [], isLoading: query.isLoading, refetch: query.refetch };
      },
    },
    create: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (data: any) => competitionQuestionsApi.create(data),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['competitionQuestions'] });
            toast.success('تم إضافة سؤال المسابقة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل إضافة سؤال المسابقة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
    delete: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (id: string) => competitionQuestionsApi.delete(id),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['competitionQuestions'] });
            toast.success('تم حذف سؤال المسابقة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل حذف سؤال المسابقة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (id: any) => mutation.mutate(id), isPending: mutationPending(mutation) };
      },
    },
  },
  // Competition Results
  competitionResults: {
    list: {
      useQuery: (competitionId: string) => {
        const query = useQuery({
          queryKey: ['competitionResults', competitionId],
          queryFn: () => competitionResultsApi.getByCompetition(competitionId),
          enabled: !!competitionId,
        });
        return { data: query.data || [], isLoading: query.isLoading };
      },
    },
    create: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (data: any) => competitionResultsApi.create(data),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['competitionResults'] });
            toast.success('تم إضافة نتيجة المسابقة بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل إضافة نتيجة المسابقة');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
  },
  // Event Registrations
  eventRegistrations: {
    register: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: ({ eventId, userId, userName, userEmail }: { eventId: string; userId: string; userName: string; userEmail: string | null }) =>
            eventRegistrationsApi.register(eventId, userId, userName, userEmail),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eventRegistrations'] });
            toast.success('تم التسجيل في الفعالية بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل التسجيل في الفعالية');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
    getByEvent: {
      useQuery: (eventId: string) => {
        const query = useQuery({
          queryKey: ['eventRegistrations', eventId],
          queryFn: () => eventRegistrationsApi.getByEvent(eventId),
          enabled: !!eventId,
        });
        return { data: query.data || [], isLoading: query.isLoading };
      },
    },
    getByUser: {
      useQuery: (userId: string) => {
        const query = useQuery({
          queryKey: ['eventRegistrations', 'user', userId],
          queryFn: () => eventRegistrationsApi.getByUser(userId),
          enabled: !!userId,
        });
        return { data: query.data || [], isLoading: query.isLoading };
      },
    },
    isRegistered: {
      useQuery: (eventId: string, userId: string) => {
        const query = useQuery({
          queryKey: ['eventRegistrations', 'check', eventId, userId],
          queryFn: () => eventRegistrationsApi.isRegistered(eventId, userId),
          enabled: !!eventId && !!userId,
        });
        return { data: query.data || false, isLoading: query.isLoading };
      },
    },
    markAttendance: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: ({ registrationId, attended }: { registrationId: string; attended: boolean }) =>
            eventRegistrationsApi.markAttendance(registrationId, attended),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eventRegistrations'] });
            toast.success('تم تحديث الحضور بنجاح');
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل تحديث الحضور');
            opts?.onError?.(error);
          },
        });
        return { mutate: (data: any) => mutation.mutate(data), isPending: mutationPending(mutation) };
      },
    },
    awardPoints: {
      useMutation: (opts?: any) => {
        const queryClient = useQueryClient();
        const mutation = useMutation({
          mutationFn: (eventId: string) => eventRegistrationsApi.awardPoints(eventId),
          onSuccess: (count: number) => {
            queryClient.invalidateQueries({ queryKey: ['eventRegistrations'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
            toast.success(`تم منح النقاط لـ ${count} مشارك`);
            opts?.onSuccess?.();
          },
          onError: (error: any) => {
            toast.error('فشل منح النقاط');
            opts?.onError?.(error);
          },
        });
        return { mutate: (eventId: any) => mutation.mutate(eventId), isPending: mutationPending(mutation) };
      },
    },
  },
  // Leaderboard
  leaderboard: {
    getTopUsers: {
      useQuery: () => {
        const query = useQuery({
          queryKey: ['leaderboard'],
          queryFn: () => leaderboardApi.getTopUsers(),
        });
        return { data: query.data || [], isLoading: query.isLoading, refetch: query.refetch };
      },
    },
  },
};

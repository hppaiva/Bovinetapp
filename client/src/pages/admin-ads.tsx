import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/queryClient";
import { Pencil, Trash2, Plus, ArrowLeft, BarChart3, Beef } from "lucide-react";
import type { Advertisement } from "@shared/schema";

const POSITIONS = [
  { value: "top_banner", label: "Banner topo (marketplace)" },
  { value: "inline_card", label: "Card entre listagens" },
  { value: "sidebar", label: "Barra lateral / dashboard" },
];

interface AdFormState {
  id?: number;
  title: string;
  position: string;
  linkUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  imageFile: File | null;
  imageUrl: string;
}

const emptyForm: AdFormState = {
  title: "",
  position: "top_banner",
  linkUrl: "",
  isActive: true,
  startDate: "",
  endDate: "",
  imageFile: null,
  imageUrl: "",
};

export default function AdminAdsPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AdFormState>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: meData, isLoading: meLoading } = useQuery<{ user: any }>({
    queryKey: ["/api/auth/me"],
  });
  const isAdmin = meData?.user?.isAdmin === true;

  const { data, isLoading } = useQuery<{ ads: Advertisement[] }>({
    queryKey: ["/api/admin/ads"],
    enabled: isAdmin,
  });

  const ads = data?.ads || [];

  const buildFormData = (state: AdFormState) => {
    const fd = new FormData();
    fd.append("title", state.title);
    fd.append("position", state.position);
    fd.append("linkUrl", state.linkUrl || "");
    fd.append("isActive", String(state.isActive));
    if (state.startDate) fd.append("startDate", state.startDate);
    if (state.endDate) fd.append("endDate", state.endDate);
    if (state.imageFile) fd.append("image", state.imageFile);
    else if (state.imageUrl) fd.append("imageUrl", state.imageUrl);
    return fd;
  };

  const submitMutation = useMutation({
    mutationFn: async (state: AdFormState) => {
      const token = getAuthToken();
      const url = state.id ? `/api/admin/ads/${state.id}` : "/api/admin/ads";
      const method = state.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        body: buildFormData(state),
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Falha ao salvar");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      toast({ title: "Anúncio salvo", description: "As alterações foram aplicadas." });
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao excluir");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      toast({ title: "Anúncio excluído" });
    },
  });

  const openCreate = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (ad: Advertisement) => {
    setForm({
      id: ad.id,
      title: ad.title,
      position: ad.position,
      linkUrl: ad.linkUrl || "",
      isActive: !!ad.isActive,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 10) : "",
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 10) : "",
      imageFile: null,
      imageUrl: ad.imageUrl,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }
    if (!form.imageFile && !form.imageUrl) {
      toast({ title: "Selecione uma imagem", variant: "destructive" });
      return;
    }
    submitMutation.mutate(form);
  };

  if (meLoading) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
        <Card className="bg-container-bg border-gray-600 max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-white text-xl font-semibold">Acesso restrito</h2>
            <p className="text-secondary">
              Esta área é exclusiva para administradores.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-accent-green hover:bg-green-600 text-white"
            >
              Voltar ao painel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg p-4 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-gray-700"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white text-2xl font-bold">Anúncios patrocinados</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/listings")}
              className="border-gray-600 text-white hover:bg-gray-700"
              data-testid="button-go-listings"
            >
              <Beef className="w-4 h-4 mr-2" /> Anúncios de Gado
            </Button>
            <Button
              onClick={openCreate}
              className="bg-accent-green hover:bg-green-600 text-white"
              data-testid="button-new-ad"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo anúncio
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-secondary text-center py-8">Carregando...</p>
        ) : ads.length === 0 ? (
          <Card className="bg-container-bg border-gray-600">
            <CardContent className="p-8 text-center text-secondary">
              Nenhum anúncio cadastrado ainda. Clique em "Novo anúncio" para começar.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {ads.map((ad) => (
              <Card key={ad.id} className="bg-container-bg border-gray-600" data-testid={`ad-card-${ad.id}`}>
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full sm:w-48 h-32 object-cover rounded border border-gray-700"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-white font-semibold text-lg">{ad.title}</h3>
                      <Badge
                        className={
                          ad.isActive
                            ? "bg-green-600 text-white"
                            : "bg-gray-600 text-white"
                        }
                      >
                        {ad.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="text-secondary text-sm">
                      Posição: {POSITIONS.find((p) => p.value === ad.position)?.label || ad.position}
                    </p>
                    {ad.linkUrl && (
                      <p className="text-secondary text-sm truncate">
                        Link: <span className="text-accent-green">{ad.linkUrl}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-secondary">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {ad.impressions ?? 0} visualizações
                      </span>
                      <span>{ad.clicks ?? 0} cliques</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(ad)}
                        className="border-gray-600 text-white hover:bg-gray-700"
                        data-testid={`button-edit-${ad.id}`}
                      >
                        <Pencil className="w-3 h-3 mr-1" /> Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Excluir o anúncio "${ad.title}"?`)) {
                            deleteMutation.mutate(ad.id);
                          }
                        }}
                        className="border-accent-red text-accent-red hover:bg-red-900/30"
                        data-testid={`button-delete-${ad.id}`}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-container-bg border-gray-600 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar anúncio" : "Novo anúncio"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-white">Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Promoção de ração XPTO"
                className="bg-primary-bg border-gray-600 text-white"
                data-testid="input-ad-title"
              />
            </div>

            <div>
              <Label className="text-white">Posição</Label>
              <Select
                value={form.position}
                onValueChange={(v) => setForm({ ...form, position: v })}
              >
                <SelectTrigger className="bg-primary-bg border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Imagem do anúncio</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] || null })}
                className="bg-primary-bg border-gray-600 text-white"
                data-testid="input-ad-image"
              />
              {form.imageUrl && !form.imageFile && (
                <img src={form.imageUrl} alt="" className="mt-2 max-h-32 rounded" />
              )}
            </div>

            <div>
              <Label className="text-white">Link de destino (opcional)</Label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="https://..."
                className="bg-primary-bg border-gray-600 text-white"
                data-testid="input-ad-link"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white">Início (opcional)</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="bg-primary-bg border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Fim (opcional)</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="bg-primary-bg border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-white">Anúncio ativo</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="bg-accent-green hover:bg-green-600 text-white"
              data-testid="button-save-ad"
            >
              {submitMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

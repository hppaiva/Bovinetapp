import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Pencil, Trash2, Plus, ArrowLeft, Megaphone } from "lucide-react";
import type { Listing } from "@shared/schema";

const SEX_OPTIONS = [
  { value: "macho", label: "Macho" },
  { value: "femea", label: "Fêmea" },
];

const AGE_OPTIONS = [
  { value: "ate12", label: "Até 12 meses" },
  { value: "12a24", label: "12 a 24 meses" },
  { value: "24a36", label: "24 a 36 meses" },
  { value: "36a48", label: "36 a 48 meses" },
  { value: "mais48", label: "Mais de 48 meses" },
];

const APTITUDE_OPTIONS = [
  { value: "corte", label: "Corte" },
  { value: "leite", label: "Leite" },
];

interface ListingForm {
  id?: number;
  quantity: string;
  sex: string;
  age: string;
  aptitude: string;
  weight: string;
  pricePerHead: string;
  city: string;
  description: string;
  acceptOffers: boolean;
  videoFile: File | null;
  videoUrl: string;
}

const emptyForm: ListingForm = {
  quantity: "",
  sex: "macho",
  age: "ate12",
  aptitude: "corte",
  weight: "",
  pricePerHead: "",
  city: "",
  description: "",
  acceptOffers: false,
  videoFile: null,
  videoUrl: "",
};

export default function AdminListingsPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ListingForm>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: meData, isLoading: meLoading } = useQuery<{ user: any }>({
    queryKey: ["/api/auth/me"],
  });
  const isAdmin = meData?.user?.isAdmin === true;

  const { data, isLoading } = useQuery<{ listings: Listing[] }>({
    queryKey: ["/api/listings"],
    enabled: isAdmin,
  });
  const listings = data?.listings || [];

  const buildFormData = (s: ListingForm) => {
    const fd = new FormData();
    fd.append("quantity", s.quantity);
    fd.append("sex", s.sex);
    fd.append("age", s.age);
    fd.append("aptitude", s.aptitude);
    fd.append("weight", s.weight);
    fd.append("pricePerHead", s.pricePerHead);
    fd.append("city", s.city);
    if (s.description) fd.append("description", s.description);
    fd.append("acceptOffers", String(s.acceptOffers));
    if (s.videoFile) fd.append("video", s.videoFile);
    return fd;
  };

  const submitMutation = useMutation({
    mutationFn: async (s: ListingForm) => {
      const token = getAuthToken();
      const url = s.id ? `/api/listings/${s.id}` : "/api/listings";
      if (s.id) {
        const res = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify({
            quantity: parseInt(s.quantity),
            sex: s.sex,
            age: s.age,
            aptitude: s.aptitude,
            weight: s.weight,
            pricePerHead: s.pricePerHead,
            city: s.city,
            description: s.description || null,
            acceptOffers: s.acceptOffers,
          }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.message || "Falha ao atualizar");
        }
        return res.json();
      }
      const res = await fetch(url, {
        method: "POST",
        body: buildFormData(s),
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Falha ao criar");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({ title: "Anúncio salvo com sucesso" });
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
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao excluir");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({ title: "Anúncio excluído" });
    },
  });

  const openCreate = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (l: Listing) => {
    setForm({
      id: l.id,
      quantity: String(l.quantity),
      sex: l.sex,
      age: l.age,
      aptitude: l.aptitude,
      weight: l.weight,
      pricePerHead: l.pricePerHead,
      city: l.city || "",
      description: l.description || "",
      acceptOffers: !!l.acceptOffers,
      videoFile: null,
      videoUrl: l.videoUrl || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.quantity || !form.weight || !form.pricePerHead || !form.city) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        description: "Quantidade, peso, preço e cidade.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(form);
  };

  if (meLoading) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#1E2A38] flex items-center justify-center p-4">
        <Card className="bg-[#2A3A4A] border-gray-600 max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-white text-xl font-semibold">Acesso restrito</h2>
            <p className="text-gray-300">Esta área é exclusiva para administradores.</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-[#4CAF50] hover:bg-green-600 text-white"
            >
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E2A38] p-4 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/ads")}
              className="text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white text-2xl font-bold">Anúncios de Gado</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/ads")}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <Megaphone className="w-4 h-4 mr-2" /> Promoções
            </Button>
            <Button
              onClick={openCreate}
              className="bg-[#4CAF50] hover:bg-green-600 text-white"
              data-testid="button-new-listing"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo lote
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-gray-300 text-center py-8">Carregando...</p>
        ) : listings.length === 0 ? (
          <Card className="bg-[#2A3A4A] border-gray-600">
            <CardContent className="p-8 text-center text-gray-300">
              Nenhum lote cadastrado ainda. Clique em "Novo lote" para começar.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((l) => (
              <Card
                key={l.id}
                className="bg-[#2A3A4A] border-gray-600 overflow-hidden"
                data-testid={`listing-card-${l.id}`}
              >
                {l.videoUrl && (
                  <video
                    className="w-full h-44 object-cover bg-black"
                    src={l.videoUrl}
                    controls
                    preload="metadata"
                  />
                )}
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white font-semibold text-lg">{l.title}</h3>
                    <Badge className={l.isActive ? "bg-green-600" : "bg-gray-600"}>
                      {l.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>
                      {l.quantity} cab. · {SEX_OPTIONS.find((s) => s.value === l.sex)?.label} ·{" "}
                      {AGE_OPTIONS.find((a) => a.value === l.age)?.label}
                    </p>
                    <p>
                      {l.weight} kg · R$ {l.pricePerHead}/cab. ·{" "}
                      {APTITUDE_OPTIONS.find((a) => a.value === l.aptitude)?.label}
                    </p>
                    {l.city && <p className="text-gray-400">📍 {l.city}</p>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(l)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Pencil className="w-3 h-3 mr-1" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Excluir o lote "${l.title}"?`)) {
                          deleteMutation.mutate(l.id);
                        }
                      }}
                      className="border-red-500 text-red-400 hover:bg-red-900/30"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#2A3A4A] border-gray-600 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar lote" : "Novo lote de gado"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white">Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="bg-[#1E2A38] border-gray-600 text-white"
                  data-testid="input-quantity"
                />
              </div>
              <div>
                <Label className="text-white">Peso médio (kg)</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="bg-[#1E2A38] border-gray-600 text-white"
                  data-testid="input-weight"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white">Sexo</Label>
                <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                  <SelectTrigger className="bg-[#1E2A38] border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEX_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Idade</Label>
                <Select value={form.age} onValueChange={(v) => setForm({ ...form, age: v })}>
                  <SelectTrigger className="bg-[#1E2A38] border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white">Aptidão</Label>
                <Select
                  value={form.aptitude}
                  onValueChange={(v) => setForm({ ...form, aptitude: v })}
                >
                  <SelectTrigger className="bg-[#1E2A38] border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APTITUDE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Preço por cabeça (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.pricePerHead}
                  onChange={(e) => setForm({ ...form, pricePerHead: e.target.value })}
                  className="bg-[#1E2A38] border-gray-600 text-white"
                  data-testid="input-price"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Cidade</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Ex: Cuiabá - MT"
                className="bg-[#1E2A38] border-gray-600 text-white"
                data-testid="input-city"
              />
            </div>

            <div>
              <Label className="text-white">Descrição (opcional)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="bg-[#1E2A38] border-gray-600 text-white"
              />
            </div>

            {!form.id && (
              <div>
                <Label className="text-white">Vídeo do lote (opcional)</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setForm({ ...form, videoFile: e.target.files?.[0] || null })
                  }
                  className="bg-[#1E2A38] border-gray-600 text-white"
                  data-testid="input-video"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="acceptOffers"
                checked={form.acceptOffers}
                onChange={(e) => setForm({ ...form, acceptOffers: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="acceptOffers" className="text-white cursor-pointer">
                Aceitar propostas (lances)
              </Label>
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
              className="bg-[#4CAF50] hover:bg-green-600 text-white"
              data-testid="button-save-listing"
            >
              {submitMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

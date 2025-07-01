import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Truck, 
  FileText, 
  Shield, 
  Camera,
  CheckCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@assets/ChatGPT Image 30 de jun. de 2025, 13_22_47_1751300800822.png";

export default function DriverRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"personal" | "vehicle" | "documents" | "completed">("personal");
  const [isLoading, setIsLoading] = useState(false);

  // Dados do formulário
  const [personalData, setPersonalData] = useState({
    fullName: "",
    cpf: "",
    rg: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContact: "",
    emergencyPhone: ""
  });

  const [vehicleData, setVehicleData] = useState({
    licensePlate: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    renavam: "",
    capacity: "",
    truckType: "",
    hasAnimTransportLicense: false,
    animalTypes: [] as string[]
  });

  const [documentsData, setDocumentsData] = useState({
    driverLicense: "",
    licenseCategory: "",
    licenseExpiry: "",
    criminalRecord: false,
    veterinaryLicense: false,
    insurancePolicy: false,
    vehicleInspection: false,
    termsAccepted: false
  });

  const handlePersonalSubmit = () => {
    if (!personalData.fullName || !personalData.cpf || !personalData.phone) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    setStep("vehicle");
  };

  const handleVehicleSubmit = () => {
    if (!vehicleData.licensePlate || !vehicleData.capacity || !vehicleData.truckType) {
      toast({
        title: "Dados incompletos", 
        description: "Preencha todos os campos obrigatórios do veículo",
        variant: "destructive"
      });
      return;
    }
    setStep("documents");
  };

  const handleFinalSubmit = async () => {
    if (!documentsData.termsAccepted || !documentsData.criminalRecord) {
      toast({
        title: "Documentação incompleta",
        description: "Aceite os termos e confirme a documentação",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular envio dos dados
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStep("completed");
      
      toast({
        title: "Cadastro realizado!",
        description: "Sua solicitação está em análise",
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível completar o cadastro",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo *</Label>
        <Input
          id="fullName"
          value={personalData.fullName}
          onChange={(e) => setPersonalData({...personalData, fullName: e.target.value})}
          placeholder="Seu nome completo"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            value={personalData.cpf}
            onChange={(e) => setPersonalData({...personalData, cpf: e.target.value})}
            placeholder="000.000.000-00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input
            id="rg"
            value={personalData.rg}
            onChange={(e) => setPersonalData({...personalData, rg: e.target.value})}
            placeholder="00.000.000-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            value={personalData.phone}
            onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
            placeholder="(11) 99999-9999"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de nascimento</Label>
          <Input
            id="birthDate"
            type="date"
            value={personalData.birthDate}
            onChange={(e) => setPersonalData({...personalData, birthDate: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={personalData.email}
          onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
          placeholder="seu@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço completo</Label>
        <Textarea
          id="address"
          value={personalData.address}
          onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
          placeholder="Rua, número, bairro"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={personalData.city}
            onChange={(e) => setPersonalData({...personalData, city: e.target.value})}
            placeholder="Sua cidade"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Select value={personalData.state} onValueChange={(value) => setPersonalData({...personalData, state: value})}>
            <SelectTrigger>
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SP">São Paulo</SelectItem>
              <SelectItem value="MG">Minas Gerais</SelectItem>
              <SelectItem value="RJ">Rio de Janeiro</SelectItem>
              <SelectItem value="PR">Paraná</SelectItem>
              <SelectItem value="SC">Santa Catarina</SelectItem>
              <SelectItem value="RS">Rio Grande do Sul</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Contato de emergência</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Nome</Label>
            <Input
              id="emergencyContact"
              value={personalData.emergencyContact}
              onChange={(e) => setPersonalData({...personalData, emergencyContact: e.target.value})}
              placeholder="Nome do contato"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Telefone</Label>
            <Input
              id="emergencyPhone"
              value={personalData.emergencyPhone}
              onChange={(e) => setPersonalData({...personalData, emergencyPhone: e.target.value})}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderVehicleForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="licensePlate">Placa do veículo *</Label>
          <Input
            id="licensePlate"
            value={vehicleData.licensePlate}
            onChange={(e) => setVehicleData({...vehicleData, licensePlate: e.target.value})}
            placeholder="ABC-1234"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Ano</Label>
          <Input
            id="year"
            value={vehicleData.year}
            onChange={(e) => setVehicleData({...vehicleData, year: e.target.value})}
            placeholder="2020"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            value={vehicleData.brand}
            onChange={(e) => setVehicleData({...vehicleData, brand: e.target.value})}
            placeholder="Mercedes, Scania, etc."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            value={vehicleData.model}
            onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
            placeholder="Atego, P310, etc."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="truckType">Tipo de caminhão *</Label>
        <Select value={vehicleData.truckType} onValueChange={(value) => setVehicleData({...vehicleData, truckType: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="truck">Caminhão 3/4</SelectItem>
            <SelectItem value="semi">Bitrem</SelectItem>
            <SelectItem value="full">Rodotrem</SelectItem>
            <SelectItem value="small">Caminhonete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Capacidade (cabeças de gado) *</Label>
        <Input
          id="capacity"
          type="number"
          value={vehicleData.capacity}
          onChange={(e) => setVehicleData({...vehicleData, capacity: e.target.value})}
          placeholder="Ex: 15"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="renavam">RENAVAM</Label>
        <Input
          id="renavam"
          value={vehicleData.renavam}
          onChange={(e) => setVehicleData({...vehicleData, renavam: e.target.value})}
          placeholder="Número do RENAVAM"
        />
      </div>

      <div className="space-y-3">
        <Label>Tipos de animais que transporta</Label>
        <div className="grid grid-cols-2 gap-2">
          {["Bovinos", "Suínos", "Equinos", "Ovinos"].map((animal) => (
            <div key={animal} className="flex items-center space-x-2">
              <Checkbox
                id={animal}
                checked={vehicleData.animalTypes.includes(animal)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setVehicleData({
                      ...vehicleData,
                      animalTypes: [...vehicleData.animalTypes, animal]
                    });
                  } else {
                    setVehicleData({
                      ...vehicleData,
                      animalTypes: vehicleData.animalTypes.filter(a => a !== animal)
                    });
                  }
                }}
              />
              <Label htmlFor={animal} className="text-sm">{animal}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDocumentsForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="driverLicense">CNH</Label>
          <Input
            id="driverLicense"
            value={documentsData.driverLicense}
            onChange={(e) => setDocumentsData({...documentsData, driverLicense: e.target.value})}
            placeholder="Número da CNH"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="licenseCategory">Categoria</Label>
          <Select value={documentsData.licenseCategory} onValueChange={(value) => setDocumentsData({...documentsData, licenseCategory: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
              <SelectItem value="E">E</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="licenseExpiry">Validade da CNH</Label>
        <Input
          id="licenseExpiry"
          type="date"
          value={documentsData.licenseExpiry}
          onChange={(e) => setDocumentsData({...documentsData, licenseExpiry: e.target.value})}
        />
      </div>

      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium">Documentação obrigatória</h4>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="criminalRecord"
              checked={documentsData.criminalRecord}
              onCheckedChange={(checked) => setDocumentsData({...documentsData, criminalRecord: !!checked})}
            />
            <Label htmlFor="criminalRecord" className="text-sm">
              Certidão de antecedentes criminais (emitida nos últimos 90 dias)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="veterinaryLicense"
              checked={documentsData.veterinaryLicense}
              onCheckedChange={(checked) => setDocumentsData({...documentsData, veterinaryLicense: !!checked})}
            />
            <Label htmlFor="veterinaryLicense" className="text-sm">
              Certificado sanitário para transporte de animais
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="insurancePolicy"
              checked={documentsData.insurancePolicy}
              onCheckedChange={(checked) => setDocumentsData({...documentsData, insurancePolicy: !!checked})}
            />
            <Label htmlFor="insurancePolicy" className="text-sm">
              Seguro do veículo e responsabilidade civil
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vehicleInspection"
              checked={documentsData.vehicleInspection}
              onCheckedChange={(checked) => setDocumentsData({...documentsData, vehicleInspection: !!checked})}
            />
            <Label htmlFor="vehicleInspection" className="text-sm">
              Vistoria técnica do veículo para transporte animal
            </Label>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="termsAccepted"
            checked={documentsData.termsAccepted}
            onCheckedChange={(checked) => setDocumentsData({...documentsData, termsAccepted: !!checked})}
          />
          <Label htmlFor="termsAccepted" className="text-sm leading-relaxed">
            Aceito os termos de uso, política de privacidade e declaro que todas as informações fornecidas são verdadeiras
          </Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-sm mx-auto p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step === "personal" ? setLocation("/login") : 
              step === "vehicle" ? setStep("personal") : 
              step === "documents" ? setStep("vehicle") : setLocation("/login")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src={logoImg} 
                alt="iFrete" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-lg font-medium">Parceiro iFrete</h1>
          </div>
          <div></div>
        </div>
      </div>

      <div className="max-w-sm mx-auto p-4">
        {step !== "completed" && (
          <>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Etapa {step === "personal" ? "1" : step === "vehicle" ? "2" : "3"} de 3
                </span>
                <span className="text-sm text-gray-600">
                  {step === "personal" ? "33%" : step === "vehicle" ? "66%" : "100%"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: step === "personal" ? "33%" : step === "vehicle" ? "66%" : "100%" 
                  }}
                ></div>
              </div>
            </div>

            {/* Form Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {step === "personal" && <FileText className="w-5 h-5" />}
                  {step === "vehicle" && <Truck className="w-5 h-5" />}
                  {step === "documents" && <Shield className="w-5 h-5" />}
                  <span>
                    {step === "personal" && "Dados pessoais"}
                    {step === "vehicle" && "Dados do veículo"}
                    {step === "documents" && "Documentação"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step === "personal" && renderPersonalForm()}
                {step === "vehicle" && renderVehicleForm()}
                {step === "documents" && renderDocumentsForm()}

                <div className="mt-6">
                  <Button
                    onClick={
                      step === "personal" ? handlePersonalSubmit :
                      step === "vehicle" ? handleVehicleSubmit :
                      handleFinalSubmit
                    }
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 py-3"
                  >
                    {isLoading ? "Processando..." :
                     step === "documents" ? "Finalizar cadastro" : "Continuar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Completed */}
        {step === "completed" && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-xl font-bold mb-2">Cadastro realizado!</h2>
              <p className="text-gray-600 mb-6">
                Sua solicitação para se tornar parceiro iFrete foi enviada. Nossa equipe analisará seus dados e documentos em até 48 horas.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2">Próximos passos:</h3>
                <ul className="text-sm text-gray-600 text-left space-y-1">
                  <li>• Análise dos documentos (24-48h)</li>
                  <li>• Vistoria técnica do veículo</li>
                  <li>• Liberação da conta</li>
                  <li>• Treinamento online</li>
                </ul>
              </div>

              <Button
                onClick={() => setLocation("/login")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Voltar ao login
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
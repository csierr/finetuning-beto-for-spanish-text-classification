import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, BookOpen, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SCHOOL_SUBJECTS = [
  { spanish: "Matemáticas", english: "Mathematics" },
  { spanish: "Física y Química", english: "Physics and Chemistry" },
  { spanish: "Geografía", english: "Geography" },
  { spanish: "Historia", english: "History" },
  { spanish: "Idiomas extranjeros", english: "Foreign Languages" },
  { spanish: "Artes", english: "Arts" },
  { spanish: "Educación física", english: "Physical Education (PE)" },
  { spanish: "Lengua y literatura", english: "Language and Literature" },
  { spanish: "Religión", english: "Religion" },
  { spanish: "Frase no relacionada con asignaturas", english: "Text not related to school subjects" },
];

const Index = () => {
  const [textToAnalyze, setTextToAnalyze] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!textToAnalyze.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      // Replace with your Flask backend URL
      const response = await fetch(
        `http://localhost:5000/subjectDetector?textToAnalyze=${encodeURIComponent(textToAnalyze)}`
      );

      if (!response.ok) {
        throw new Error("Error al analizar el texto");
      }

      // Backend returns JSON { predicted_class, class_probabilities }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.predicted_class || JSON.stringify(data));
      
      toast({
        title: "Analysis Complete",
        description: "The text has been analyzed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not connect to the server. Make sure Flask is running on http://localhost:5000",
        variant: "destructive",
      });
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4 shadow-lg">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent pb-2">
            School Subject Detector
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Natural language analysis to identify Spanish school subjects from text
          </p>
        </div>

        <div className="grid gap-6 max-w-5xl mx-auto">
          {/* Input Card */}
          <Card className="shadow-medium border-border/50 animate-slide-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Enter text to analyze
              </CardTitle>
              <CardDescription>
                Write or paste the text (in Spanish!) you want to analyze to identify which school subject it belongs to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: Fórmula para calcular el área de un círculo es πr²..."
                value={textToAnalyze}
                onChange={(e) => setTextToAnalyze(e.target.value)}
                className="min-h-[150px] resize-y text-base"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Run Analysis"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Subjects List Card */}
          <Card className="shadow-medium border-border/50 animate-slide-in" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle>Detectable Subjects</CardTitle>
              <CardDescription>
                The system can identify the following school subjects:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SCHOOL_SUBJECTS.map((subject) => (
                  <Tooltip key={subject.spanish} delayDuration={200}>
                    {/* Wrap the Badge in a lightweight element that forwards refs to
                        ensure the TooltipTrigger can attach listeners. Some UI
                        Badge components don't forward refs, which causes tooltips
                        to fall back to a '?' placeholder. */}
                    <TooltipTrigger asChild>
                      <span className="inline-block" aria-label={subject.english}>
                        <Badge
                          variant="secondary"
                          className="px-3 py-1 text-sm hover:bg-secondary/80 transition-colors cursor-help"
                        >
                          {subject.spanish}
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{subject.english}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Result Card */}
          {result && (
            <Card className="shadow-medium border-border/50 animate-fade-in bg-gradient-to-br from-card to-secondary/20">
              <CardHeader>
                <CardTitle className="text-primary">Analysis Result</CardTitle>
                <CardDescription>Detected subject:</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <p className="text-2xl font-semibold text-foreground">{result}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <a
              href="https://huggingface.co/dccuchile/bert-base-spanish-wwm-uncased"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              BETO
            </a>
            , a BERT-based model trained on a large Spanish corpus
          </p>
        </div>
      </main>
    </div>
    </TooltipProvider>
  );
};

export default Index;

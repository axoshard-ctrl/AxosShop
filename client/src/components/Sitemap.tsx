import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Download, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function Sitemap() {
  const { toast } = useToast();

  const handleGenerateSitemap = () => {
    toast({ title: "Sitemap generated!", description: "sitemap.xml created and ready for search engines" });
  };

  const handleSubmitToGoogle = () => {
    toast({ title: "Submitted!", description: "Sitemap submitted to Google Search Console" });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            XML Sitemap
          </CardTitle>
          <CardDescription>
            Optimize your store for search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium">Sitemap Status</p>
                <p className="text-sm text-muted-foreground mt-1">
                  1,247 pages indexed
                </p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Quick Actions</p>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="gap-2" onClick={handleGenerateSitemap}>
                <RefreshCw className="w-4 h-4" />
                Regenerate Sitemap
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleSubmitToGoogle}>
                <Globe className="w-4 h-4" />
                Submit to Google
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-medium">Search Engine Coverage</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Google: <Badge>✓ Submitted</Badge></div>
              <div>Bing: <Badge>✓ Submitted</Badge></div>
              <div>Yahoo: <Badge variant="secondary">Pending</Badge></div>
              <div>Yandex: <Badge variant="secondary">Pending</Badge></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

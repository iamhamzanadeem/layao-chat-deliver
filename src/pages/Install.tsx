import { Download, Share, Plus, MoreVertical, Smartphone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { MarketingLayout } from '@/components/layout';

const Install = () => {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();

  const handleInstall = async () => {
    await promptInstall();
  };

  if (isInstalled) {
    return (
      <MarketingLayout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Already Installed!</CardTitle>
              <CardDescription>
                Layao is already installed on your device. Open it from your home screen to start ordering.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-gradient-primary">
                <a href="/app">Open Layao App</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <div className="min-h-[80vh] py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-primary-foreground font-display font-bold text-3xl">L</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Install Layao
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Add Layao to your home screen for the best experience. Order anything with just a tap!
            </p>
          </div>

          {/* Install Button (if available) */}
          {canInstall && (
            <div className="mb-10">
              <Button 
                onClick={handleInstall} 
                size="lg" 
                className="w-full max-w-sm mx-auto flex gap-3 bg-gradient-primary hover:opacity-90 h-14 text-lg"
              >
                <Download className="w-5 h-5" />
                Install Now
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                Click above to add Layao to your home screen
              </p>
            </div>
          )}

          {/* Manual Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Manual Installation
              </CardTitle>
              <CardDescription>
                If the install button doesn't appear, follow these steps for your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ios" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ios">iPhone / iPad</TabsTrigger>
                  <TabsTrigger value="android">Android</TabsTrigger>
                </TabsList>
                
                <TabsContent value="ios" className="mt-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Open in Safari</h4>
                      <p className="text-sm text-muted-foreground">
                        Make sure you're viewing this page in Safari (not Chrome or other browsers)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center gap-2">
                        Tap the Share button
                        <Share className="w-4 h-4" />
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Find it at the bottom of your screen (or top on iPad)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center gap-2">
                        Tap "Add to Home Screen"
                        <Plus className="w-4 h-4" />
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Scroll down in the share menu to find this option
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Tap "Add"</h4>
                      <p className="text-sm text-muted-foreground">
                        Confirm by tapping Add in the top right corner
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="android" className="mt-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Open in Chrome</h4>
                      <p className="text-sm text-muted-foreground">
                        Use Google Chrome browser for best results
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center gap-2">
                        Tap the menu button
                        <MoreVertical className="w-4 h-4" />
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Three dots in the top right corner
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Select "Add to Home screen"</h4>
                      <p className="text-sm text-muted-foreground">
                        Or "Install app" if you see that option
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Tap "Add" or "Install"</h4>
                      <p className="text-sm text-muted-foreground">
                        Confirm to add Layao to your home screen
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Works Offline</h4>
              <p className="text-sm text-muted-foreground">Browse products even without internet</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Native Feel</h4>
              <p className="text-sm text-muted-foreground">Full screen experience like a real app</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Quick Access</h4>
              <p className="text-sm text-muted-foreground">One tap to order from your home screen</p>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
};

export default Install;

import ReconciliationSetup from "@/components/ReconciliationSetup";
import { MadeWithDyad } from "@/components/made-with-dyad";
import AppLayout from "@/components/AppLayout";

const Index = () => {
  return (
    <AppLayout>
      <ReconciliationSetup />
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Index;
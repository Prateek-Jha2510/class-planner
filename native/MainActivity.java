package in.classplanner.student;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle state) {
        registerPlugin(PlannerDocuments.class);
        super.onCreate(state);
    }
}

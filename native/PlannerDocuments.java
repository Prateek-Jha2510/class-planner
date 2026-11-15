package in.classplanner.student;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

// The user picks a file with Android's Save As dialog. No storage permission is needed.
@CapacitorPlugin(name = "PlannerDocuments")
public class PlannerDocuments extends Plugin {
    @PluginMethod
    public void save(PluginCall call) {
        if (call.getString("text") == null) {
            call.reject("Missing backup data.");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, call.getString("filename", "class-planner.json"));
        startActivityForResult(call, intent, "onFileChosen");
    }

    @ActivityCallback
    private void onFileChosen(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject response = new JSObject();
        if (result.getResultCode() != Activity.RESULT_OK) {
            response.put("cancelled", true);
            call.resolve(response);
            return;
        }
        Uri uri = result.getData() == null ? null : result.getData().getData();
        if (uri == null) {
            call.reject("No destination file selected.");
            return;
        }
        getBridge().execute(() -> {
            try (OutputStream stream = getContext().getContentResolver().openOutputStream(uri, "wt")) {
                if (stream == null) throw new IOException("Cannot open the selected file.");
                stream.write(call.getString("text", "").getBytes(StandardCharsets.UTF_8));
            } catch (IOException | SecurityException e) {
                call.reject("Could not write backup.", e);
                return;
            }
            response.put("cancelled", false);
            call.resolve(response);
        });
    }
}

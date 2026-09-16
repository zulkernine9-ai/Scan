package com.example.camscanner_pro

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.PointF
import org.opencv.android.Utils
import org.opencv.core.*
import org.opencv.imgproc.Imgproc
import java.io.File
import java.io.FileOutputStream
import kotlin.math.hypot
import kotlin.math.max

object DocumentTransformHelper {
    /**
     * Unskews 4 points quad into a clean rectangular document
     */
    fun warpPerspectiveAndSave(
        sourceImagePath: String,
        points: List<PointF>,
        outputPath: String
    ): Boolean {
        val srcBitmap = BitmapFactory.decodeFile(sourceImagePath) ?: return false

        val tl = points[0]
        val tr = points[1]
        val br = points[2]
        val bl = points[3]

        val maxWidth = max(
            hypot((tr.x - tl.x).toDouble(), (tr.y - tl.y).toDouble()),
            hypot((br.x - bl.x).toDouble(), (br.y - bl.y).toDouble())
        )
        val maxHeight = max(
            hypot((bl.x - tl.x).toDouble(), (bl.y - tl.y).toDouble()),
            hypot((br.x - tr.x).toDouble(), (br.y - tr.y).toDouble())
        )

        val srcMat = Mat()
        Utils.bitmapToMat(srcBitmap, srcMat)

        val srcPoints = MatOfPoint2f(
            Point(tl.x.toDouble(), tl.y.toDouble()),
            Point(tr.x.toDouble(), tr.y.toDouble()),
            Point(br.x.toDouble(), br.y.toDouble()),
            Point(bl.x.toDouble(), bl.y.toDouble())
        )

        val dstPoints = MatOfPoint2f(
            Point(0.0, 0.0),
            Point(maxWidth - 1, 0.0),
            Point(maxWidth - 1, maxHeight - 1),
            Point(0.0, maxHeight - 1)
        )

        val transformMatrix = Imgproc.getPerspectiveTransform(srcPoints, dstPoints)
        val destMat = Mat(maxHeight.toInt(), maxWidth.toInt(), CvType.CV_8UC4)

        Imgproc.warpPerspective(
            srcMat,
            destMat,
            transformMatrix,
            Size(maxWidth, maxHeight),
            Imgproc.INTER_CUBIC
        )

        val outBitmap = Bitmap.createBitmap(maxWidth.toInt(), maxHeight.toInt(), Bitmap.Config.ARGB_8888)
        Utils.matToBitmap(destMat, outBitmap)

        FileOutputStream(File(outputPath)).use { out ->
            outBitmap.compress(Bitmap.CompressFormat.JPEG, 95, out)
        }

        srcMat.release()
        destMat.release()
        transformMatrix.release()
        srcBitmap.recycle()
        outBitmap.recycle()

        return true
    }
}

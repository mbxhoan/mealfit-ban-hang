import AppKit
import CoreImage
import Foundation
import Vision

enum CutoutError: Error {
  case invalidArgs
  case cannotLoadImage
  case cannotCreateCGImage
  case noMaskObservation
  case cannotRenderOutput
  case cannotEncodePNG
}

func loadCGImage(from url: URL) throws -> CGImage {
  guard let image = NSImage(contentsOf: url) else {
    throw CutoutError.cannotLoadImage
  }
  var rect = CGRect(origin: .zero, size: image.size)
  guard let cgImage = image.cgImage(forProposedRect: &rect, context: nil, hints: nil) else {
    throw CutoutError.cannotCreateCGImage
  }
  return cgImage
}

func writePNG(_ cgImage: CGImage, to url: URL) throws {
  let bitmap = NSBitmapImageRep(cgImage: cgImage)
  guard let data = bitmap.representation(using: .png, properties: [:]) else {
    throw CutoutError.cannotEncodePNG
  }
  try data.write(to: url)
}

func cutoutImage(inputURL: URL, outputURL: URL) throws {
  let cgImage = try loadCGImage(from: inputURL)
  let handler = VNImageRequestHandler(cgImage: cgImage)
  let request = VNGenerateForegroundInstanceMaskRequest()
  request.usesCPUOnly = true
  try handler.perform([request])

  guard let observation = request.results?.first else {
    throw CutoutError.noMaskObservation
  }

  let maskBuffer = try observation.generateScaledMaskForImage(forInstances: observation.allInstances, from: handler)
  let source = CIImage(cgImage: cgImage)
  let mask = CIImage(cvPixelBuffer: maskBuffer)
  let clear = CIImage(color: .clear).cropped(to: source.extent)

  guard let filter = CIFilter(name: "CIBlendWithMask") else {
    throw CutoutError.cannotRenderOutput
  }
  filter.setValue(source, forKey: kCIInputImageKey)
  filter.setValue(clear, forKey: kCIInputBackgroundImageKey)
  filter.setValue(mask, forKey: kCIInputMaskImageKey)

  guard
    let output = filter.outputImage,
    let rendered = CIContext().createCGImage(output, from: source.extent)
  else {
    throw CutoutError.cannotRenderOutput
  }

  try writePNG(rendered, to: outputURL)
}

do {
  guard CommandLine.arguments.count == 3 else {
    throw CutoutError.invalidArgs
  }
  let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
  let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
  try cutoutImage(inputURL: inputURL, outputURL: outputURL)
} catch {
  fputs("cutout-error: \(error)\n", stderr)
  exit(1)
}

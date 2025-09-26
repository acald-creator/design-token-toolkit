
//
// StyleDictionaryColor.m
//

// Do not edit directly, this file was auto-generated.


#import "StyleDictionaryColor.h"

@implementation StyleDictionaryColor

+ (UIColor *)color:(StyleDictionaryColorName)colorEnum{
  return [[self values] objectAtIndex:colorEnum];
}

+ (NSArray *)values {
  static NSArray* colorArray;
  static dispatch_once_t onceToken;

  dispatch_once(&onceToken, ^{
    colorArray = @[
[UIColor colorWithRed:0.000f green:0.000f blue:0.000f alpha:1.000f],
[UIColor colorWithRed:1.000f green:1.000f blue:1.000f alpha:1.000f],
[UIColor colorWithRed:1.000f green:0.980f blue:0.941f alpha:1.000f],
[UIColor colorWithRed:0.996f green:0.922f blue:0.784f alpha:1.000f],
[UIColor colorWithRed:0.984f green:0.827f blue:0.553f alpha:1.000f],
[UIColor colorWithRed:0.965f green:0.678f blue:0.333f alpha:1.000f],
[UIColor colorWithRed:0.929f green:0.537f blue:0.212f alpha:1.000f],
[UIColor colorWithRed:0.867f green:0.420f blue:0.125f alpha:1.000f],
[UIColor colorWithRed:0.753f green:0.337f blue:0.129f alpha:1.000f],
[UIColor colorWithRed:0.612f green:0.259f blue:0.129f alpha:1.000f],
[UIColor colorWithRed:0.482f green:0.204f blue:0.118f alpha:1.000f],
[UIColor colorWithRed:0.898f green:0.941f blue:0.992f alpha:1.000f],
[UIColor colorWithRed:0.780f green:0.827f blue:0.902f alpha:1.000f],
[UIColor colorWithRed:0.588f green:0.698f blue:0.855f alpha:1.000f],
[UIColor colorWithRed:0.451f green:0.584f blue:0.792f alpha:1.000f],
[UIColor colorWithRed:0.337f green:0.420f blue:0.788f alpha:1.000f],
[UIColor colorWithRed:0.290f green:0.329f blue:0.784f alpha:1.000f],
[UIColor colorWithRed:0.278f green:0.243f blue:0.655f alpha:1.000f],
[UIColor colorWithRed:0.243f green:0.267f blue:0.714f alpha:1.000f],
[UIColor colorWithRed:0.204f green:0.200f blue:0.373f alpha:1.000f],
[UIColor colorWithRed:0.176f green:0.157f blue:0.561f alpha:1.000f],
[UIColor colorWithRed:0.929f green:0.961f blue:0.933f alpha:1.000f],
[UIColor colorWithRed:0.851f green:0.894f blue:0.910f alpha:1.000f],
[UIColor colorWithRed:0.765f green:0.855f blue:0.937f alpha:1.000f],
[UIColor colorWithRed:0.655f green:0.714f blue:0.792f alpha:1.000f],
[UIColor colorWithRed:0.439f green:0.561f blue:0.592f alpha:1.000f],
[UIColor colorWithRed:0.325f green:0.412f blue:0.467f alpha:1.000f],
[UIColor colorWithRed:0.259f green:0.329f blue:0.427f alpha:1.000f],
[UIColor colorWithRed:0.196f green:0.204f blue:0.310f alpha:1.000f],
[UIColor colorWithRed:0.141f green:0.157f blue:0.243f alpha:1.000f],
[UIColor colorWithRed:0.098f green:0.106f blue:0.157f alpha:1.000f],
[UIColor colorWithRed:0.969f green:0.980f blue:0.988f alpha:1.000f],
[UIColor colorWithRed:0.945f green:0.961f blue:0.976f alpha:1.000f],
[UIColor colorWithRed:0.886f green:0.910f blue:0.941f alpha:1.000f],
[UIColor colorWithRed:0.796f green:0.835f blue:0.882f alpha:1.000f],
[UIColor colorWithRed:0.580f green:0.639f blue:0.722f alpha:1.000f],
[UIColor colorWithRed:0.392f green:0.455f blue:0.545f alpha:1.000f],
[UIColor colorWithRed:0.278f green:0.333f blue:0.412f alpha:1.000f],
[UIColor colorWithRed:0.200f green:0.255f blue:0.333f alpha:1.000f],
[UIColor colorWithRed:0.118f green:0.161f blue:0.231f alpha:1.000f],
[UIColor colorWithRed:0.059f green:0.090f blue:0.165f alpha:1.000f]
    ];
  });

  return colorArray;
}

@end
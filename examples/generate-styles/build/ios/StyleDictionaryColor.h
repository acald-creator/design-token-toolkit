
//
// StyleDictionaryColor.h
//

// Do not edit directly, this file was auto-generated.


#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger, StyleDictionaryColorName) {
ColorsBlack,
ColorsWhite,
ColorsOrange100,
ColorsOrange200,
ColorsOrange300,
ColorsOrange400,
ColorsOrange500,
ColorsOrange600,
ColorsOrange700,
ColorsOrange800,
ColorsOrange900,
ColorsTestPrimary50,
ColorsTestPrimary100,
ColorsTestPrimary200,
ColorsTestPrimary300,
ColorsTestPrimary400,
ColorsTestPrimary500,
ColorsTestPrimary600,
ColorsTestPrimary700,
ColorsTestPrimary800,
ColorsTestPrimary900,
ColorsTestSecondary50,
ColorsTestSecondary100,
ColorsTestSecondary200,
ColorsTestSecondary300,
ColorsTestSecondary400,
ColorsTestSecondary500,
ColorsTestSecondary600,
ColorsTestSecondary700,
ColorsTestSecondary800,
ColorsTestSecondary900,
ColorsTestNeutral50,
ColorsTestNeutral100,
ColorsTestNeutral200,
ColorsTestNeutral300,
ColorsTestNeutral400,
ColorsTestNeutral500,
ColorsTestNeutral600,
ColorsTestNeutral700,
ColorsTestNeutral800,
ColorsTestNeutral900
};

@interface StyleDictionaryColor : NSObject
+ (NSArray *)values;
+ (UIColor *)color:(StyleDictionaryColorName)color;
@end
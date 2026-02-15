import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // Story 104.9: Web User Profile View
    @Get('me')
    getMyProfile() {
        // Mock: In real app, extracting userId from Request/JWT
        return this.userService.getProfile('user_1');
    }

    @Put('me')
    updateMyProfile(@Body() body: any) {
        return this.userService.updateProfile('user_1', body);
    }

    @Put('me/password')
    changePassword(@Body() body: any) {
        // Mock user ID 'user_1'
        return this.userService.changePassword('user_1', body);
    }




    // Story 104.11: Forgot Password
    @Post('password/reset-request')
    requestPasswordReset(@Body() body: { email: string }) {
        return this.userService.requestPasswordReset(body.email);
    }

    @Post('password/reset')
    resetPassword(@Body() body: { token: string, newPassword: string }) {
        return this.userService.resetPassword(body.token, body.newPassword);
    }



    // Story 104.11: Privacy Center
    @Put('me/preferences')
    updatePreferences(@Body() body: any) {
        return this.userService.updatePreferences('user_1', body);
    }

    @Get('me/preferences')
    getPreferences() {
        // Mock default
        return { marketingEmails: true };
    }



    // Story 104.10: Profile Picture
    @Post('me/profile-picture')
    updateProfilePicture(@Body() body: any) {
        // Mock file handling - simulates receiving a file or URL
        return this.userService.updateProfilePicture('user_1', body);
    }

    @Delete('me/profile-picture')
    removeProfilePicture() {
        return this.userService.removeProfilePicture('user_1');
    }

    // Business Profile
    @Get(':userId/business-profile')
    getBusinessProfile(@Param('userId') userId: string) {
        return this.userService.getBusinessProfile(userId);
    }

    @Put(':userId/business-profile')
    updateBusinessProfile(@Param('userId') userId: string, @Body() body: any) {
        return this.userService.updateBusinessProfile(userId, body);
    }

    // Story 34.4: Corporate Policies
    @Get('corporate/:companyId/policies')
    getCorporatePolicies(@Param('companyId') companyId: string) {
        return this.userService.getCorporatePolicies(companyId);
    }

    // Story 27.2: Saved Places
    @Get(':userId/saved-places')
    getSavedPlaces(@Param('userId') userId: string) {
        return this.userService.getSavedPlaces(userId);
    }

    @Post(':userId/saved-places')
    savePlace(@Param('userId') userId: string, @Body() place: any) {
        return this.userService.savePlace(userId, place);
    }

    @Delete(':userId/saved-places/:placeId')
    deleteSavedPlace(@Param('userId') userId: string, @Param('placeId') placeId: string) {
        return this.userService.deleteSavedPlace(userId, placeId);
    }

    // Story 27.3: Recent Destinations
    @Get(':userId/recent-destinations')
    getRecentDestinations(@Param('userId') userId: string) {
        return this.userService.getRecentDestinations(userId);
    }
    // Story 103.2: Downline
    @Get(':userId/downline')
    getDownline(@Param('userId') userId: string) {
        return this.userService.getDownline(userId);
    }

    @Get('suspended/all')
    getSuspended() {
        return this.userService.getSuspendedUsers();
    }

    @Post(':userId/reactivate')
    reactivate(@Param('userId') userId: string) {
        return this.userService.reactivateUser(userId);
    }
}
